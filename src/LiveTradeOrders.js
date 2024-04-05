import React, { useEffect, useState } from 'react';
import { useMutation, useSubscription, gql } from '@apollo/client';

const ADD_TRADE_MUTATION = gql`
  mutation AddTrade($type: String!, $shareName: String, $price: Int!, $quantity: Int!) {
    addTrade(type: $type, shareName: $shareName, price: $price, quantity: $quantity) {
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

    const [addTrade] = useMutation(ADD_TRADE_MUTATION);
    const { data: newOrderData } = useSubscription(TRADE_ORDER_UPDATED_SUBSCRIPTION);
    const [tradeForm, setTradeForm] = useState({
        type: '', // 'BUY' or 'SELL'
        shareName: '', // Assuming you want the user to input this as well
        price: 0,
        quantity: 0,
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
    };

    useEffect(() => {
        // Handle new trade order data
        const orders = newOrderData?.tradeOrderUpdated
        if (orders) {
            setTradeOrders(orders)
            // console.log('New trade order:', newOrderData?.tradeOrderUpdated);
            // Update UI or perform any necessary actions
        }

    }, [newOrderData]);

    console.log({ tradeOrders })

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
            </div>



            <h1>Trade Order List </h1>
            <div style={{ display: "flex" }} >

                <div className='buyOrders'>
                    <h4>Buy </h4>
                    {tradeOrders?.buyOrders.map((order, index) =>
                        <div key={index + 1}>
                            <div>
                                <span>{order?.price}</span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{order?.quantity}</span>
                            </div>
                        </div>
                    )}
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <div className='sellOrders'>
                    <h4>Sell </h4>
                    {tradeOrders?.sellOrders.map((order, index) =>
                        <div key={index + 1}>
                            <div>
                                <span>{order?.price}</span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{order?.quantity}</span>
                            </div>
                        </div>
                    )}
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <div className='tradeHistory'>
                    <h4>Histry </h4>
                    {tradeOrders?.tradeHistory.map((order, index) =>
                        <div key={index + 1}>
                            <div>
                                <span>{order?.price}</span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{order?.quantity}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
};

export default TradeForm;







