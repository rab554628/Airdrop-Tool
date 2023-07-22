import React from "react";
import Card from "../components/Card";
import Airdrop1155 from "../components/ERC1155Airdrop";
import Airdrop721 from "../components/ERC721Airdrop";
import Airdrop20 from "../components/ERC20Airdrop"
import styles from "../styles/Home.module.css";

interface Tab {
  title: string;
  content: JSX.Element;
}

const tabs: Tab[] = [
  {
    title: "ERC20",
    content: <Airdrop20 />,
  },
  {
    title: "ERC721",
    content: <Airdrop721 />,
  },
  {
    title: "ERC1155",
    content: <Airdrop1155 />,
  },
];

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.cardContainer}>
          <Card tabs={tabs} />
        </div>
      </main>
    </div>
  );
};

export default Home;
