import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(cors());
const port = 4000;
app.use(express.json({ limit: "500mb" }));

const prisma = new PrismaClient();

app.listen(port, () => {
	console.log(new Date() + " backend runnin on port " + port);
});

const genAI = new GoogleGenerativeAI("");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `Hey this is my prisma model Invoice
	id              String   @id @default(auto()) @map("_id") @db.ObjectId
  shopName        String
  location        String
  gstNumber       String
  invoiceNumber   Int
  customerName    String
  customerId      String
  customerAddress String
  invoiceDate     String
  dueDate         String
  creditDays      Int
  pos             String
  productDetails  Json     
  totalAmount     Float
  discount        Float
  invoiceAmount   Float
  remarks         String?
 can you just give me the output from the image that i give to you so that i can directly feed it to database according if data not found for specific coloum just make it empty of that data type string should be "" number can be 0 leave no non-whitespaces`;

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
	const typeofInput = req.body.type;
	const base64 = req.body.file;

	function inputPrompt(base64) {
		if (typeofInput === "image") {
			const imageBase64 = req.body.file;
			if (!imageBase64) {
				return res
					.status(400)
					.json({ msg: "No file provided in the request." });
			}
			const image = {
				inlineData: {
					data: base64,
					mimeType: "image/jpg",
				},
			};
			return image;
		} else if (typeofInput === "pdf") {
			const pdfBase64 = req.body.file;
			if (!pdfBase64) {
				return res
					.status(400)
					.json({ msg: "No file provided in the request." });
			}
			const image = {
				inlineData: {
					data: base64,
					mimeType: "application/pdf",
				},
			};
			return image;
		} else {
			return res.status(411).json({ msg: "File Input is not Needed" });
		}
	}

	const imagePrompt = inputPrompt(base64);

	console.log(123);
	try {
		console.log(imagePrompt);
		const data = await InvoiceDetail(imagePrompt);
		if (data) {
			const match = data.match(/\{[\s\S]*\}/);
			if (match) {
				const jsonString = match[0];
				console.log(jsonString);
				const jsonObject = JSON.parse(jsonString);
				console.log(jsonObject);
				const dbData = await prisma.invoice.create({
					data: jsonObject,
				});
				if (dbData) {
					res.json({
						msg: "SUCCESS",
						data: jsonObject,
						type: typeof data,
					});
				} else {
					res.status(411).json({ msg: "dbData not found" });
				}
			} else {
				res.status(411).json({ msg: "Match not found" });
			}
		} else {
			res.status(411).json({ msg: "FAILED due to data is null" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "FAILED", error: error.message });
	}
});
