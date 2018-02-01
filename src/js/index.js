import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import './../css/index.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastWinner: 0,
            numberOfBets: 0,
            minimumBet: 0,
            totalBet: 0,
            maxAmountOfBets: 0,
        }
        if(typeof web3 != 'undefined'){
            console.log("Using web3 detected from external source like Metamask")
            this.web3 = new Web3(web3.currentProvider)
        } else {
            console.log("No web3 detected.Falling back to http://localhost:9545.You should remove this fallback when you deploy live, as it's inherently insecure.Consider switching to MetaMask for devlopment.More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"))
        }
        const MyContract = web3.eth.contract([{ "constant": false, "inputs": [{ "name": "number", "type": "uint256" }], "name": "bet", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "player", "type": "address" }], "name": "checkPlayerExists", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "numberWinner", "type": "uint256" }], "name": "distributePrizes", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "generateNumberWinner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "resetData", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_minimumBet", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }])

        this.state.ContractInstance = MyContract.at("0x9f2c1cbf7a7976a88152239ceff9e060553c4cad")
    }
    componentDidMount() {
        this.updateState();
        this.setUpListeners();
        setInterval(this.updateState.bind(this), 10e3);
    }
    updateState() {
        this.state.ContractInstance.minimumBet((err, result) => {
            if (result != null) {
                this.setState({
                    minimumBet: parseFloat(web3.fromWei(result, 'ether'))
                })
            }
        })
        this.state.ContractInstance.totalBet((err, result) => {
            if (result != null) {
                this.setState({
                    totalBet: parseFloat(web3.fromWei(result, 'ether'))
                })
            }
        })
        this.state.ContractInstance.numberOfBets((err, result) => {
            if (result != null) {
                this.setState({
                    numberOfBets:  parseInt(result)
                })
            }
        })
        this.state.ContractInstance.maxAmountOfBets((err, result) => {
            if (result != null) {
                this.setState({
                    maxAmountOfBets: parseInt(result)
                })
            }
        })
    }
    // Listen for events and exeutes the voteNumber method
    setupListeners() {
        let liNodes = this.refs.numbers.querySelectorAll('li');
        liNodes.forEach(number => {
            number.addEventListener('click', event => {
                event.target.className = 'number-selected'
                this.voteNumber(parseInt(event.target.innerHTML), done => {
                    // Remove the other number selected
                    for(let i = 0; i < liNodes.length; i++) {
                        liNodes[i].className = ''
                    }
                })
            })
        })
    }
    voteNumber(number, cb) {
        let bet = this.refs['ether-bet'].value
        if (!bet) bet = 0.1
        if (parseFloat(bet) < this.state.minimumBet) {
            alert('You must bet more than the minimum')
            cb()
        } else {
            this.state.ContractInstance.bet(number, {
                gas: 300000,
                from: web3.eth.accounts[0],
                value: web3.toWei(bet, 'ether')
            }, (err, result) => {
                cb()
            })
        }
    }

    render() {
        return (
            <div className="main-container">
                <h1>Bet for your best number and win huge amounts of Ether</h1>
                <div className="block">
                    <b>Number of Bets:</b> &nsbp;
                    <span>{this.state.numberOfBets}</span>
                </div>
                <div className="block">
                    <b>Last number Winner:</b> &nsbp;
                    <span>{this.state.lastWinner}</span>
                </div>
                <div className="block">
                    <b>Total ether bet:</b> &nbsp;
                    <span>{this.state.totalBet} ether</span>
                </div>
                <div className="block">
                    <b>Minimum bet:</b> &nbsp;
                    <span>{this.state.minimumBet} ether</span>
                </div>
                <div className="block">
                    <b>Max amount of bets:</b> &nbsp;
                    <span>{this.state.maxAmountOfBets} ether</span>
                </div>
                <hr/>
                <h2>Vote for the next number</h2>
                <label>
                    <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet} /></b> ether
                    <br />
                </label>
                <ul>
                    <li onClick={() => { this.voteNumber(1) }}>1</li>
                    <li onClick={() => { this.voteNumber(2) }}>2</li>
                    <li onClick={() => { this.voteNumber(3) }}>3</li>
                    <li onClick={() => { this.voteNumber(4) }}>4</li>
                    <li onClick={() => { this.voteNumber(5) }}>5</li>
                    <li onClick={() => { this.voteNumber(6) }}>6</li>
                    <li onClick={() => { this.voteNumber(7) }}>7</li>
                    <li onClick={() => { this.voteNumber(8) }}>8</li>
                    <li onClick={() => { this.voteNumber(9) }}>9</li>
                    <li onClick={() => { this.voteNumber(10) }}>10</li>
                </ul>
            </div>
        )
    }
}

ReactDOM.render(
    <App/>,
    document.querySelector('#root')
);