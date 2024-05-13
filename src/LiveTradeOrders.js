import React, { useEffect, useState } from 'react';
import { useMutation, useSubscription, gql } from '@apollo/client';
import "./trade.css"
import { fetchAllCategories } from '.';



const ADD_TRADE_MUTATION = gql`
  mutation AddTrade($type: String!, $price: Int!, $quantity: Int!) {
    addTrade(type: $type, shareName: "CCD", price: $price, quantity: $quantity, coinPairWith:"INR") {

      type
      shareName
      price
      quantity
      userId
      serialNo
      createdAt
    }
  }
`;


const TRADE_ORDER_UPDATED_SUBSCRIPTION = gql`
  subscription {
    tradeOrderUpdated {
        buyOrders {
            type
            price
            quantity
        }
        sellOrders {
            type
            price
            quantity
        }
        tradeHistory{
            type
            price
            quantity
            createdAt
        }
    }
   }
`;

const TradeForm = () => {

    const [tradeOrders, setTradeOrders] = useState()
    const [walletData, setwalletData] = useState({})
    const [wallePriceKey, setWallePriceKey] = useState(["WALLET#PENDING#PRICE_AMOUNT", "WALLET#REMAINING#PRICE_AMOUNT"])
    const [walleCoinKey, setWalleCoinKey] = useState(["WALLET#PENDING#COIN#CCC#PAIR_WITH_INR", "WALLET#REMAINING#COIN#CCC#PAIR_WITH_INR"])
    const [wallePriceAmount, setWallePriceAmount] = useState([])
    const [walleCoinAmount, setWalleCoinAmount] = useState([])

    const [addTrade] = useMutation(ADD_TRADE_MUTATION);
    const { data: newOrderData } = useSubscription(TRADE_ORDER_UPDATED_SUBSCRIPTION);
    const [tradeForm, setTradeForm] = useState({
        type: '', // 'BUY' or 'SELL'
        shareName: '', // Assuming you want the user to input this as well
        price: 50,
        quantity: 10,
    });

    const filterData = () => {
        walletData.forEach((vl) => {
            let priceData = {};
            let coinData = {};
            console.log(vl.SK === "WALLET#PENDING#PRICE_AMOUNT")
            if (vl.SK === "WALLET#PENDING#PRICE_AMOUNT") {
                priceData.pendingAmount = vl.price;
            }
            if (vl.SK === "WALLET#REMAINING#PRICE_AMOUNT") {
                priceData.remainingAmount = vl.price;
            }
            if (vl.SK === "WALLET#PENDING#COIN#CCC#PAIR_WITH_INR") {
                coinData.pendingTotalSupply = vl.totalSupply;
            }
            if (vl.SK === "WALLET#REMAINING#COIN#CCC#PAIR_WITH_INR") {
                coinData.remainingTotalSupply = vl.totalSupply;
            }

            if (Object.keys(priceData).length > 0) {
                setWallePriceAmount(priceData);
            }
            if (Object.keys(coinData).length > 0) {
                setWalleCoinAmount(coinData);
            }
        });
    }


    // walletData.map((vl) => vl.SK == wallePriceKey(vl.SK))
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTradeForm(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAddTrade = (type, price, quantity) => {
        // Perform mutation to add a new trade order
        addTrade({ variables: { type: type, price: price, quantity } });
        // fetchAllCategories().then(({ getWalletDetails }) => {
        //     setwalletData(getWalletDetails)
        // })
    };

    useEffect(() => {
        // Handle new trade order data
        console.log({ newOrderData })

        const orders = newOrderData?.tradeOrderUpdated
        // console.log({ orders })
        if (orders) {
            setTradeOrders(orders)
            // console.log('New trade order:', newOrderData?.tradeOrderUpdated);
            // Update UI or perform any necessary actions
        }

    }, [newOrderData]);

    useEffect(() => {
        // fetchAllCategories().then(({ getWalletDetails }) => {
        //     setwalletData(getWalletDetails)
        // })
        // filterData()

    }, [])

    // console.log({ walletData, wallePriceAmount, walleCoinAmount })

    return (
        <>
            <div style={{ display: "flex" }}>
                <div className='tradeForm' style={{ marginRight: '32px' }}>
                    <h4>Buy Trade Order</h4>
                    {/* <input type='text' name="shareName" placeholder='Share Name' value={tradeForm.shareName} onChange={handleInputChange} /> */}
                    <input type='number' name="price" placeholder='Price' value={tradeForm.price} onChange={handleInputChange} /><br />
                    <input type='number' name="quantity" placeholder='Quantity' value={tradeForm.quantity} onChange={handleInputChange} /><br />
                    <button onClick={() => handleAddTrade('BUY', parseInt(tradeForm.price), parseInt(tradeForm.quantity))}>
                        Add Buy Trade
                    </button>
                </div>

                <div className='tradeForm'>
                    <h4>Sell Trade Order</h4>
                    {/* <input type='text' name="shareName" placeholder='Share Name' value={tradeForm.shareName} onChange={handleInputChange} /> */}
                    <input type='number' name="price" placeholder='Price' value={tradeForm.price} onChange={handleInputChange} /><br />
                    <input type='number' name="quantity" placeholder='Quantity' value={tradeForm.quantity} onChange={handleInputChange} /><br />
                    <button onClick={() => handleAddTrade('SELL', parseInt(tradeForm.price), parseInt(tradeForm.quantity))}>
                        Add Sell Trade
                    </button>
                </div>


                <div style={{ display: "flex" }} className='wallet data '>
                    <div style={{ marginLeft: "8%" }}>
                        <h2>Wallet Price </h2>
                        <div style={{ display: "flex" }}>
                            <div>Remaining  Price</div>  &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
                            <div><b>{walletData?.remaining_price?.price}</b></div>
                        </div>
                        <div style={{ display: "flex" }}>
                            <div>Pending Price  </div>  &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
                            <div><b>{walletData?.pending_price?.price}</b></div>
                        </div>

                    </div>
                    <div style={{ marginLeft: "8%" }}  >
                        <h2>Wallet Coins   </h2>({walletData?.remaining_coin?.coinCode})
                        {/* <div style={{ display: "flex" }}>
                            <div>Coins</div>  &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
                            <div><b>{walletData?.remaining_coin?.coinCode}</b></div>
                        </div>
                        <hr /> */}
                        <div style={{ display: "flex" }}>
                            <div>Remaining  Supply</div>  &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
                            <div><b>{walletData?.remaining_coin?.totalSupply}</b></div>
                        </div>
                        <div style={{ display: "flex" }}>
                            <div>Pending Supply</div>  &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
                            <div><b>{walletData?.pending_coin?.totalSupply}</b></div>
                        </div>

                    </div>
                </div>
            </div>



            <h1>Trade Order List </h1>
            <div className="tradeOrdersContainer">
                <div className='buyOrders'>
                    <div className="orderHeader">Buy Orders</div>
                    {tradeOrders?.buyOrders.map((order, index) => (
                        <div className="orderCard" key={index}>
                            <div className="orderBody">
                                <div className="orderDetail">
                                    <span className="price">Price: {order?.price}</span>
                                    <span className="quantity">Quantity: {order?.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='sellOrders'>
                    <div className="orderHeader">Sell Orders</div>
                    {tradeOrders?.sellOrders.map((order, index) => (
                        <div className="orderCard" key={index}>
                            <div className="orderBody">
                                <div className="orderDetail">
                                    <span className="price">Price: {order?.price}</span>
                                    <span className="quantity">Quantity: {order?.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='tradeHistory'>
                    <div className="orderHeader">History</div>
                    {tradeOrders?.tradeHistory.map((order, index) => (
                        <div className="orderCard" key={index}>
                            <div className="orderBody">
                                <div className="orderDetail">
                                    <span className="price">Price: {order?.price}</span>
                                    <span className="quantity">Quantity: {order?.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default TradeForm;

