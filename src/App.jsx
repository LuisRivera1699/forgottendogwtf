import connectWalletButtonImage from "./assets/connect-wallet.svg";
import twitterImage from "./assets/twitter.svg";
import openseaImage from "./assets/opensea.svg";
import titleImage from "./assets/title.svg";
import minusImage from "./assets/minus.svg";
import plusImage from "./assets/plus.svg";
import counterImage from "./assets/mint-counter.svg";
import mintImage from "./assets/mint-button.svg";
import infoImage from "./assets/mint-info.svg";
import honorImage from "./assets/honor-text.svg";
import walletImage from "./assets/wallet.svg";
import soldoutImage from "./assets/sold-out.svg";
import soonImage from "./assets/soon.svg";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./utils/constants/contracts";

const App = (props) => {
  const [mintCounter, setMintCounter] = useState(1);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [canMint, setCanMint] = useState(false);
  const [balance, setBalance] = useState(0);

  const handlePlus = () => {
    if (mintCounter < 5) {
      setMintCounter(mintCounter+1);
    }
  }

  const handleMinus = () => {
    if (mintCounter > 1) {
      setMintCounter(mintCounter-1);
    }
  }

  const formatWallet = () => {
      let first = currentAccount.slice(0, 4);
      let last = currentAccount.slice(-4);
      return first+"..."+last;
  }

  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;

    if (!ethereum) {
      alert("Man, go and get Metamask!");
      return;
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      setCurrentAccount(accounts[0]);

      let chainId = await ethereum.request({method: 'eth_chainId'});
      if (chainId !== "0x1") {
        alert("You are connected to another network. Please switch your Metamask to Ethereum Mainnet and update the page.");
      }
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert("Man, go and get Metamask!");
        return;
      }

      const accounts = await ethereum.request({method: 'eth_requestAccounts'});

      setCurrentAccount(accounts[0]);

      let chainId = await ethereum.request({method: 'eth_chainId'});
      if (chainId !== "0x1") {
        alert("You are connected to another network. Please switch your Metamask to Ethereum Mainnet and update the page.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getSaleStatus = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fdContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        let saleStage = await fdContract.saleStage();
        let totalSupply = await fdContract.totalSupply();
        
        if (saleStage === 0) {
          setCanMint(false);
          return;
        }

        if (saleStage === 1) {
          setCanMint(true);
          return;
        }

        if (totalSupply.toNumber() === 10000 || saleStage === 2) {
          setIsSoldOut(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getMyBalance = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fdContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        let myBalance = await fdContract.balanceOf(currentAccount);
      
        setBalance(myBalance.toNumber());
      }
    } catch (error) {
      console.error(error);
    }
  }

  const mint = async () => {
    try {
      const {ethereum} = window;
      if (ethereum && canMint && balance < 20) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fdContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        let mintTxn;

        if (balance >= 8) {
          mintTxn = await fdContract.publicMint(mintCounter, {value: ethers.utils.parseEther(`${0.002*mintCounter}`)});
        } else {
          if (balance + mintCounter > 8) {
            mintTxn = await fdContract.publicMint(mintCounter, {value: ethers.utils.parseEther(`${0.002*(balance+mintCounter-8)}`)});
          } else {
            mintTxn = await fdContract.publicMint(mintCounter, {value: ethers.utils.parseEther(`0.0`)});
          }
        }

        await mintTxn.wait();
        alert(`Congratulations! Forgotten Dog Minted, you can now see your Forgotten Dog on Opensea. ${balance+mintCounter == 20 ? 'You have reached the max amount of Forgottend Dogs minted.' : `You can still mint another ${20 - (balance+mintCounter)} Forgotten Dogs.`}`);
        getMyBalance();
      } else if (!canMint) {
        alert(currentAccount ? 'Mint has not started yet!' : 'Wallet is not connected');
      } else if (balance === 20) {
        alert('Max NFTs per holder reached!');
      }
    } catch (error) {
      console.error(error);
      if (mintCounter + balance > 20) {
        alert('Would reach max NFTs per holder!');
      } else {
        alert(error.message);
      }
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  });

  useEffect(() => {
    if (currentAccount) {
      getSaleStatus();
      getMyBalance();
    }
  });

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on(
        'accountsChanged', () => {
          window.location.reload();
        }
      );
      window.ethereum.on(
        'chainChanged', () => {
          window.location.reload();
        }
      );
    }
  });

  return (
    <div className="__container">
      <div className="wallet__container">
        { !canMint && currentAccount ? null :
          currentAccount ?
          <div className="wallet__wrapper">
            <img className="wallet__button" src={walletImage} alt=""/>
            <span className="wallet__text">{formatWallet(currentAccount)}</span>
          </div> :
          <img className="wallet__button" onClick={connectWallet} src={connectWalletButtonImage} alt=""/>
        }
      </div>
      <div className="rrss__container">
        <a href="https://twitter.com/forgottendogwtf" target="_blank" rel="noreferrer"><img className="__rrss __left" src={twitterImage} alt=""/></a>
        <a href="https://opensea.io/collection/forgottendog-wtf" target="_blank" rel="noreferrer"><img className="__rrss __right" src={openseaImage} alt=""/></a>
      </div>
      <div className="title__container">
        <img className="__title" src={titleImage} alt="" />
      </div>
      <div className="counter__container">
        <img className="item__counter __minus __left" onClick={handleMinus} src={minusImage} alt=""/>
        <div className="number__box">
          <img className="item__counter __counter" src={counterImage} alt=""/>
          <span className="counter__text">{mintCounter}</span>
        </div>
        <img className="item__counter __plus __right" onClick={handlePlus} src={plusImage} alt=""/>
      </div>
      <div className="mint__container">
        {
          !canMint ? <img className="mint__button __right" src={soldoutImage} alt=""/> :
          isSoldOut ?
          <img className="mint__button __right" src={soldoutImage} alt=""/> :
          <img className="mint__button __left" onClick={mint} src={soldoutImage} alt=""/>
        }
        <img className="mint__info" src={infoImage} alt=""/>
      </div>
      <div className="honor__container">
        <img className="honor__text" src={honorImage} alt=""/>
      </div>
    </div>
  );
}

export default App;
