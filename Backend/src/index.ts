import express from 'express'

const port = 8000

const app = express()

app.get("/", (req, res) => {
	res.send('Hello world')
})

app.listen(port, () => {
	console.log(`Now listening port ${port}`)
})