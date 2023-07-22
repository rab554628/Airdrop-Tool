import { useState } from "react";
import { useContract, useContractWrite } from "@thirdweb-dev/react";
import { ERC1155_AIRDROP } from "../const/Addresses";
import styles from "../styles/Airdrop.module.css";

export default function Airdrop1155() {
  const { contract } = useContract(ERC1155_AIRDROP);
  const { mutateAsync: airdrop, isLoading } = useContractWrite(contract, "airdrop");

  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [successData, setSuccessData] = useState<{ addresses: string[]; tokenIds: number[]; amounts: number[] } | null>(
    null
  );

  interface PreviewData {
    amounts: any;
    recipients: string[];
    tokenIds: number[];
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
        const { recipients, tokenIds, amounts } = parseCSV(csvData);
        setPreviewData({ recipients, tokenIds, amounts });
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
          const { recipients, tokenIds, amounts } = parseCSV(csvData);

          const data = await airdrop({ args: [tokenAddress, ownerAddress, recipients, amounts, tokenIds] });
          console.info("Contract call success", data);
          setSuccessData({ addresses: recipients, tokenIds, amounts });
        }
      };
      reader.readAsText(csvFile);
    } catch (err) {
      console.error("Contract call failure", err);
    }
  };

  const parseCSV = (csvData: string) => {
    const recipients: string[] = [];
    const tokenIds: number[] = [];
    const amounts: number[] = [];
  
    const lines = csvData.split("\n");
  
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
  
      const [recipient, tokenId, amount] = line.split(",");
  
      recipients.push(recipient.trim());
      tokenIds.push(parseInt(tokenId.trim()));
      amounts.push(parseInt(amount.trim()));
    }
  
    return { recipients, tokenIds, amounts };
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
              <th>Token ID</th>
              <th>Amount</th> {/* Added amount column */}
            </tr>
          </thead>
          <tbody>
            {previewData.recipients.map((recipient, index) => (
              <tr key={index}>
                <td>{recipient}</td>
                <td>{previewData.tokenIds[index]}</td>
                <td>{previewData.amounts[index]}</td> {/* Display the amount */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  const downloadExampleCSV = () => {
    const exampleCSVData = `recipient,tokenId,amount\n0x8449D665755d2b7900FC43000E768EA56eaCc604,3,10\n0x8449D665755d2b7900FC43000E768EA56eaCc604,5,10`;
    const blob = new Blob([exampleCSVData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "exampleERC1155.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <h1>ERC1155 Airdrop</h1>
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
                Address: {address}, Token ID: {successData.tokenIds[index]}
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
