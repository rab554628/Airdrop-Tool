import { useState } from "react";
import { useContract, useContractWrite } from "@thirdweb-dev/react";
import { ERC20_AIRDROP } from "../const/Addresses";
import styles from "../styles/Airdrop.module.css";

export default function Airdrop20() {
    const { contract } = useContract(ERC20_AIRDROP);
    const { mutateAsync: airdrop, isLoading } = useContractWrite(contract, "airdrop");

    const [csvFile, setCSVFile] = useState<File | null>(null);
    const [tokenAddress, setTokenAddress] = useState<string>("");
    const [ownerAddress, setOwnerAddress] = useState<string>("");
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [successData, setSuccessData] = useState<{ addresses: string[]; amounts: number[] } | null>(null);

    interface PreviewData {
        recipients: string[];
        amounts: number[];
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setCSVFile(file);
            setPreviewData(null); // Reset the preview data when a new file is selected
            handlePreview(file);
        }
    };

    const handlePreview = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            if (e.target?.result) {
                const csvData = e.target.result as string;
                const { recipients, amounts } = parseCSV(csvData);
                setPreviewData({ recipients, amounts });
            }
        };
        reader.readAsText(file);
    };

    const call = async () => {
        try {
            if (!csvFile) {
                console.error("No CSV file uploaded");
                return;
            }

            if (!tokenAddress || !ownerAddress) {
                console.error("Token Address and Owner Address are required");
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                if (e.target?.result) {
                    const csvData = e.target.result as string;
                    const { recipients, amounts } = parseCSV(csvData);

                    const data = await airdrop({ args: [tokenAddress, ownerAddress, recipients, amounts] });
                    console.info("Contract call success", data);
                    setSuccessData({ addresses: recipients, amounts });
                }
            };
            reader.readAsText(csvFile);
        } catch (err) {
            console.error("Contract call failure", err);
        }
    };

    const parseCSV = (csvData: string) => {
        const recipients: string[] = [];
        const amounts: number[] = [];

        const lines = csvData.split("\n");

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length === 0) continue;

            const [recipient, tokenId] = line.split(",");

            recipients.push(recipient.trim());
            amounts.push(parseInt(tokenId.trim()));
        }

        return { recipients, amounts };
    };

    const PreviewComponent = () => {
        if (!previewData) return null;

        return (
            <div className={styles.previewContainer}>
                <h3>Preview</h3>
                <table className={styles.previewTable}>
                    <thead>
                        <tr>
                            <th>Recipient</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {previewData.recipients.map((recipient, index) => (
                            <tr key={index}>
                                <td>{recipient}</td>
                                <td>{previewData.amounts[index]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const downloadExampleCSV = () => {
        const exampleCSVData = `recipient,amounts\n0xFe62CD02AFF3641B89c6718732c4B5042a78De79,25\n0x7f0EF299BDbCF7418fc03450428F2310Fef101FF,10\n0xFe62CD02AFF3641B89c6718732c4B5042a78De79,5\n0x7f0EF299BDbCF7418fc03450428F2310Fef101FF,5`;
        const blob = new Blob([exampleCSVData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "exampleERC20.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputContainer}>
                <h1>ERC20 Airdrop</h1>
                <label>Token Address:</label>
                <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className={styles.input}
                />
            </div>
            <div className={styles.inputContainer}>
                <label>Owner Address:</label>
                <input
                    type="text"
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    className={styles.input}
                />
            </div>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            {previewData && <PreviewComponent />}
            <button className={styles.button} onClick={call} disabled={!csvFile || isLoading}>
                Airdrop Tokens
            </button>
            {isLoading && <p>Loading...</p>}
            {successData && (
                <div>
                    <h3>Success</h3>
                    <p>Airdropped addresses:</p>
                    <ul>
                        {successData.addresses.map((address, index) => (
                            <li key={index}>
                                Address: {address}, Amount: {successData.amounts[index]}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <button className={styles.exampleCSV} onClick={downloadExampleCSV}>
                Download Example CSV
            </button>
        </div>
    );
}
