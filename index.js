import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";

const app = express();
const port = 4000;
app.use(express.json({ limit: "50mb" }));

app.listen(port, () => {
	console.log(new Date() + " backend runnin on port " + port);
});

const genAI = new GoogleGenerativeAI("AIzaSyBeKYDLpQUWMvvheTHpFyzxgkDDnvj1wBw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `Hey this is my prisma model model Invoice
	id              String   @id @default(auto()) @map("_id") @db.ObjectId
  shopName        String
  location        String
  gstNumber       String
  invoiceNumber   Int
  customerName    String
  customerId      String
  customerAddress String
  invoiceDate     DateTime
  dueDate         DateTime
  creditDays      Int
  pos             String
  productDetails  Json     
  totalAmount     Float
  discount        Float
  invoiceAmount   Float
  remarks         String?
 can you just give me the output from the imgae so that i can directly feed it to database according if not found just live it empty`;

async function InvoiceDetail(image) {
	try {
		const result = await model.generateContent([image, prompt]);
		const response = result.response.text();
		return response;
	} catch (e) {
		console.log("Error" + e);
		return e;
	}
}

app.get("/test", (req, res) => {
	const body = req.body;
	res.json({ body: body });
});

app.post("/", async (req, res) => {
	const imageBase64 = req.body.file;

	if (!imageBase64) {
		return res.status(400).json({ msg: "No file provided in the request." });
	}
	console.log(123);
	try {
		const data = await InvoiceDetail(imageBase64);
		res.json({ msg: "SUCCESS", data });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "FAILED", error: error.message });
	}
});
