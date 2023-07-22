import React, { useState } from "react";
import styles from "../styles/Airdrop.module.css";

interface Tab {
  title: string;
  content: JSX.Element;
}

interface CardProps {
  tabs: Tab[];
}

const Card: React.FC<CardProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className={styles.card}>
      <div className={styles.tab}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab ${activeTab === index ? styles.active : ""}`}
            onClick={() => handleTabClick(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className={styles.content}>{tabs[activeTab].content}</div>
    </div>
  );
};

export default Card;
