import './App.css';
import './Add.css'
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


  
function Add() {
	const keywords=["Cholorphyll"]
	const [scanImage, updateScanImage]=useState();
	const [summary,updateSummary]=useState("");
	const [noOfRows,updateRows]=useState(0);
	const fileUpload=React.createRef();
	const uploadImage=(event)=>{
		fileUpload.current.click();
	};
	const changeScanImage=(event)=>{
		console.log(event.target.files[0])
		updateScanImage(URL.createObjectURL(event.target.files[0]))
		fetch("http://127.0.0.1:3000/ocr-train").then((res)=>{
			res.text().then((text)=>{
				updateSummary(text);
				updateRows(1);
			})
		})
	}
	const addData=(event)=>{
		alert("Pushed to db")
		updateSummary("");
		updateRows(0);
	}
	return (
	<div className="App">
		<div className="navbar">
		<span className="heading">Training</span>
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
				{Array.from(Array(noOfRows),(e,i)=>{
					return <Paper key={i} sx={{borderRadius:"15px", backgroundColor:"#263238"}} elevation={6} className="paper1">
								<h2>Explain Keyword -{keywords[i]}</h2>
									<CssTextField className="keyanswer" label="Outlined" variant="outlined" />			
							</Paper>;
				})}
				
				<div style={{width:"100%",marginTop:"50px"}}>
					<Button className="addButton" variant="contained" disableElevation onClick={addData}>
						Add Data
					</Button>
				</div>
				

			</div>
		</div>
	</div>
	);
}

export default Add;
