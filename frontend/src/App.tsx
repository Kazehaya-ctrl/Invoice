import React, { useState } from "react";
import "./App.css";

function App() {
	const [selectFile, setSelectedFile] = useState<File | null>();
	const handleClick = async (e: any) => {
		e.preventDefault();
		console.log("hello");
		if (!selectFile) {
			alert("Select a file");
			return;
		}

		const reader = new FileReader();
		reader.onloadend = async () => {
			const base64String = reader.result as string;
			const realBase64 = base64String.split(",")[1];
			console.log({ base: realBase64 });

			try {
				const response = await fetch("http://localhost:4000", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ file: realBase64 }),
				});

				if (response.ok) {
					const result = await response.json();
					console.log("File uploaded successfully:", result);
				} else {
					console.error("File upload failed:", response.statusText);
				}
			} catch (error) {
				console.error("Error uploading file:", error);
			}
		};
		reader.readAsDataURL(selectFile);
	};

	return (
		<>
			<input
				type="file"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					if (e.target.files && e.target.files.length > 0) {
						setSelectedFile(e.target.files[0]);
					}
				}}
			/>
			<button onClick={handleClick}>Submit</button>
		</>
	);
}

export default App;
