import './App.css';
import { Paper, Button, ButtonGroup, InputBase } from '@mui/material';
import TestImage from './images/test.png';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';
import React, { useState } from 'react';

const theme = createTheme({
	status: {
	  danger: '#e53e3e',
	},
	palette: {
	  primary: {
		main: '#0971f1',
		darker: '#053e85',
	  },
	  neutral: {
		main: '#FFF',
		contrastText: '#fff',
	  },
	},
});
const CssTextField = styled(InputBase)(({ theme }) => ({
	'label + &': {
		marginTop: theme.spacing(3),
	  },
	  '& .MuiInputBase-input': {
		borderRadius: 10,
		position: 'relative',
		color:"white",
		border: '1.5px solid #FFF',
		fontSize: 16,
		padding: '10px 12px',
		transition: theme.transitions.create([
		  'border-color',
		  'background-color',
		  'box-shadow',
		]),
		// Use the system font instead of the default Roboto font.
		fontFamily: [
		  '-apple-system',
		  'BlinkMacSystemFont',
		  '"Segoe UI"',
		  'Roboto',
		  '"Helvetica Neue"',
		  'Arial',
		  'sans-serif',
		  '"Apple Color Emoji"',
		  '"Segoe UI Emoji"',
		  '"Segoe UI Symbol"',
		].join(','),
		'&:focus': {
		  boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
		  borderColor: theme.palette.primary.main,
		},
		
		
	  },
}));
  
function App() {
	const [scanImage, updateScanImage]=useState();
	const [summary,updateSummary]=useState("");
	const [answer,showAnswer]=useState(0);
	const [statusText,updateStatusText]=useState("")
	const fileUpload=React.createRef();
	const uploadImage=(event)=>{
		fileUpload.current.click();
	};
	const changeScanImage=(event)=>{
		console.log(event.target.files[0])
		updateScanImage(URL.createObjectURL(event.target.files[0]))
		fetch("http://127.0.0.1:3000/ocr").then((res)=>{
			res.text().then((text)=>{
				updateSummary(text)
				showAnswer(1);
				updateStatusText("1/1 keywords found! Accuracy 100%")
			})
		})
	}
	return (
	<div className="App">
		<div className="navbar">
		<span className="heading">Evaluating</span>
		<span className="statustext">{statusText}</span>
		</div>
		<div className="maincontent">
			<Paper sx={{borderRadius:"15px"}} elevation={6} className="imgpaper">
				<input style={{opacity:0}} ref={fileUpload} type="file" onChange={changeScanImage}/>
				<img alt="scan" src={scanImage}  className="imgleft" onClick={uploadImage}></img>
			</Paper>
			
			<div className="right-pane">
				<Paper sx={{borderRadius:"15px", backgroundColor:"#0E4DA4"}} elevation={6} className="paper1">
					<h2>Summary Text</h2>
					<div style={{marginLeft:"30px",marginRight:"30px",paddingBottom:"30px", display:"flex", flexDirection:"column"}}>
						<span className="summarytext">
							{summary}
						</span>
						<ThemeProvider theme={theme}>
							<ButtonGroup className="actions" color="neutral" variant="outlined" aria-label="outlined button group" >
								<Button>Rescan</Button>
								<Button>Copy</Button>
							</ButtonGroup>
						</ThemeProvider>
					</div>
					
				</Paper>
				{/* <Paper sx={{borderRadius:"15px", backgroundColor:"#4CAF50"}} elevation={6} className="paper1">
					<h2>What was the minuteman stepping away from?</h2>
						<CssTextField className="keyanswer" label="Outlined" variant="outlined" value="Plow" />			
				</Paper> */}
				{answer?<Paper sx={{borderRadius:"15px", backgroundColor:"#4CAF50"}} elevation={6} className="paper1">
					<h2>What is responsible for the green color of Plants?</h2>
						<CssTextField className="keyanswer" label="Outlined" variant="outlined" value="Chlorophyll" />			
				</Paper>:<div></div>}
				
			</div>
		</div>
	</div>
	);
}

export default App;
