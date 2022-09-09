from flask import request
from flask import Flask  
import pytorch_lightning as pl
import sys
import torch
from torch.utils.data import Dataset, DataLoader
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint
from pytorch_lightning.loggers import TensorBoardLogger
from transformers import (
    AdamW,
    T5ForConditionalGeneration,
    T5TokenizerFast as T5Tokenizer
)
import pandas as pd

MODEL_NAME = 't5-small'
tokenizer=T5Tokenizer.from_pretrained(MODEL_NAME)

class SummaryModel(pl.LightningModule):

    def __init__(self):
        super().__init__()
        self.model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME, return_dict=True)
    
    def forward(self, input_ids, attention_mask, decoder_attention_mask, labels=None):
        output = self.model(
            input_ids,
            attention_mask=attention_mask,
            labels=labels,
            decoder_attention_mask=decoder_attention_mask
        )

        return output.loss, output.logits

    def training_step(self, batch, batch_size):
        input_ids = batch['text_input_ids']
        attention_mask = batch['text_attention_mask']
        labels = batch['labels']
        labels_attention_mask = batch['labels_attention_mask']

        loss, outputs = self(
            input_ids=input_ids,
            attention_mask=attention_mask,
            decoder_attention_mask=labels_attention_mask,
            labels=labels
        )

        self.log("train_loss", loss, prog_bar=True, logger=True)
        return loss
    
    def validation_step(self, batch, batch_size):
        input_ids = batch['text_input_ids']
        attention_mask = batch['text_attention_mask']
        labels = batch['labels']
        labels_attention_mask = batch['labels_attention_mask']

        loss, outputs = self(
            input_ids=input_ids,
            attention_mask=attention_mask,
            decoder_attention_mask=labels_attention_mask,
            labels=labels
        )

        self.log("val_loss", loss, prog_bar=True, logger=True)
        return loss

    def test_step(self, batch, batch_size):
        input_ids = batch['text_input_ids']
        attention_mask = batch['text_attention_mask']
        labels = batch['labels']
        labels_attention_mask = batch['labels_attention_mask']

        loss, outputs = self(
            input_ids=input_ids,
            attention_mask=attention_mask,
            decoder_attention_mask=labels_attention_mask,
            labels=labels
        )

        self.log("test_loss", loss, prog_bar=True, logger=True)
        return loss

    def configure_optimizers(self):
        return AdamW(self.parameters(), lr=0.0001)

checkpoint_callback = ModelCheckpoint(
    dirpath='checkpoints',
    filename='best-checkpoint',
    save_top_k=1,
    verbose=True,
    monitor='val_loss',
    mode='min'
)

logger = TensorBoardLogger("lightning_logs", name='news-summary')

trainer = pl.Trainer(
    callbacks=[checkpoint_callback],
    max_epochs=5)

trained_model=SummaryModel.load_from_checkpoint(
    "checkpoints/best-checkpoint.ckpt"
)
trained_model.freeze()


#QA Model

class BioQAModel(pl.LightningModule):
   def __init__(self):
     super().__init__()
     self.model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME, return_dict=True)
   def forward(self, input_ids, attention_mask, labels=None):
     output = self.model(
         input_ids, 
         attention_mask=attention_mask,
         labels=labels)
     return output.loss, output.logits
   def training_step(self, batch, batch_idx):
     input_ids = batch['input_ids']
     attention_mask=batch['attention_mask']
     labels = batch['labels']
     loss, outputs = self(input_ids, attention_mask, labels)
     self.log("train_loss", loss, prog_bar=True, logger=True)
     return loss
   def validation_step(self, batch, batch_idx):
     input_ids = batch['input_ids']
     attention_mask=batch['attention_mask']
     labels = batch['labels']
     loss, outputs = self(input_ids, attention_mask, labels)
     self.log("val_loss", loss, prog_bar=True, logger=True)
     return loss
   def test_step(self, batch, batch_idx):
     input_ids = batch['input_ids']
     attention_mask=batch['attention_mask']
     labels = batch['labels']
     loss, outputs = self(input_ids, attention_mask, labels)
     self.log("test_loss", loss, prog_bar=True, logger=True)
     return loss
   def configure_optimizers(self):
     optimizer = AdamW(self.parameters(), lr=0.0001)
     return optimizer

trained_qa_model = BioQAModel.load_from_checkpoint("checkpoints/best-checkpoint-qa.ckpt")
trained_qa_model.freeze()

def generate_answer(question):
   source_encoding=tokenizer(
       question["question"],
       question['context'],
       max_length = 396,
       padding="max_length",
       truncation="only_second",
       return_attention_mask=True,
       add_special_tokens=True,
       return_tensors="pt"
   )
   generated_ids = trained_qa_model.model.generate(
       input_ids=source_encoding["input_ids"],
       attention_mask=source_encoding["attention_mask"],
       num_beams=1,  # greedy search
       max_length=80,
       repetition_penalty=2.5,
       early_stopping=True,
       use_cache=True)
   preds = [
           tokenizer.decode(generated_id, skip_special_tokens=True, clean_up_tokenization_spaces=True)
           for generated_id in generated_ids
   ]
   return "".join(preds)



def summarizeText(text):
    text_encoding = tokenizer(
        text,
        max_length=512,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        add_special_tokens=True,
        return_tensors='pt'
    )
    generated_ids = trained_model.model.generate(
        input_ids=text_encoding['input_ids'],
        attention_mask=text_encoding['attention_mask'],
        min_length=30,
        max_length=100,
        num_beams=2,
        repetition_penalty=2.5,
        length_penalty=1.0,
        early_stopping=True
    )

    preds = [
            tokenizer.decode(gen_id, skip_special_tokens=True, clean_up_tokenization_spaces=True)
            for gen_id in generated_ids
    ]
    return "".join(preds)
app = Flask(__name__) #creating the Flask class object   
 
@app.route('/') #decorator drfines the   
def home(): 
    return "hello, this is our first flask website";  
  
@app.route("/summary")
def summary():
    return summarizeText(request.args.get("context"))
@app.route("/qamodel")
def qamodel():
    data=[[request.args.get("text"),request.args.get("question")]]
    df = pd.DataFrame(data, columns = ['context', 'question'])
    # print(df)
    ans=generate_answer(df.iloc[0])
    return ans

if __name__ =='__main__':  
    app.run(debug = True)  
