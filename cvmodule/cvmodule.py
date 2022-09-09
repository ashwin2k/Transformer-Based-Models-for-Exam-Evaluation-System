import numpy as np
import pytesseract
import sys
import cv2
# pytesseract.pytesseract.tesseract_cmd = r'/home/local/ZOHOCORP/ashwin-13877/anaconda3/envs/exam/bin/pytesseract'

path = "./final-1.png"
yellow_hsv = (176, 255, 238)
img = cv2.imread(path)
img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
img_threshold = cv2.inRange(img_hsv, (20, 255, 255), (45, 255, 255))
# img_threshold = cv2.inRange(img_hsv, (0, 255, 22), (0, 255, 108))  # red


kernel = np.ones((5, 5), np.uint8)

closing = cv2.morphologyEx(img_threshold, cv2.MORPH_CLOSE, kernel)

contours, hierarchy = cv2.findContours(
    image=closing, mode=cv2.RETR_EXTERNAL, method=cv2.CHAIN_APPROX_SIMPLE)
image_copy = img.copy()
# cv2.drawContours(image=image_copy, contours=contours, contourIdx=-1,
#                  color=(0, 255, 0), thickness=2, lineType=cv2.LINE_AA)
cnts = contours[0] if len(contours) == 2 else contours[1]
cropped_imgs = []
for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    cropped_imgs.append(img_threshold[y:y+h, x:x+w])
    cv2.rectangle(image_copy, (x, y), (x + w, y + h), (0, 0, 255), 2)
# print(len(cropped_imgs))

# OCR operation
summary = ""
sampleres = cv2.GaussianBlur(cropped_imgs[0], (3, 3), 0)
sampleres = 255 - sampleres

# for cropped_img in cropped_imgs:
summary += pytesseract.image_to_string(sampleres, lang="eng", config='--psm 6')
print(summary)
# sys.output.flush()
# cv2.imshow("frame", )
cv2.imshow("frame",   np.array(sampleres))
cv2.imshow("frame1",   img_threshold)
cv2.imshow("frame2",   closing)

cv2.waitKey(0)
