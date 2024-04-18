import React, { useEffect, useState } from 'react';
import { useMutation, useSubscription, gql } from '@apollo/client';
import "./trade.css"
import { fetchAllCategories } from '.';




const ADD_TRADE_MUTATION = gql`
  mutation AddTrade($type: String!, $price: Int!, $quantity: Int!) {
    addTrade(type: $type, shareName: "CCC", price: $price, quantity: $quantity, coinPairWith:"INR") {
      id
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
    const [walletData, setwalletData] = useState([])

    const [addTrade] = useMutation(ADD_TRADE_MUTATION);
    const { data: newOrderData } = useSubscription(TRADE_ORDER_UPDATED_SUBSCRIPTION);
    const [tradeForm, setTradeForm] = useState({
        type: '', // 'BUY' or 'SELL'
        shareName: '', // Assuming you want the user to input this as well
        price: 50,
        quantity: 10,
    });




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
        fetchAllCategories().then(({ getWalletDetails }) => {
            setwalletData(getWalletDetails)
        })
    };

    useEffect(() => {
        // Handle new trade order data
        // console.log({ newOrderData })

        const orders = newOrderData?.tradeOrderUpdated

        if (orders) {
            setTradeOrders(orders)
            // console.log('New trade order:', newOrderData?.tradeOrderUpdated);
            // Update UI or perform any necessary actions
        }

    }, [newOrderData]);

    useEffect(() => {
        fetchAllCategories().then(({ getWalletDetails }) => {
            setwalletData(getWalletDetails)
        })
    })

    console.log({ walletData })

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


                <div className='wallet data '>
                    <div >
                        {walletData.map((vl, index) =>
                            <>
                                <div>
                                    <div style={{ display: "flex" }}>
                                        <div>{vl?.SK}</div>  &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
                                        <div><b>{vl?.price}</b></div>
                                    </div>
                                    <br />
                                </div>
                            </>
                        )}
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

