import React, { useState, useEffect } from "react";
import { Row } from "react-bootstrap";
import LimitOrder from "./LimitOrder";
import { Nav, Tab } from 'react-bootstrap';
import { fetchTradeOrders } from '../../../apolloClientConnection/apolloClient';
import MarketOrder from "./MarketOrder";
import { useMutation, useSubscription, gql } from '@apollo/client';

const TRADE_ORDER_UPDATED_SUBSCRIPTION = gql`
  subscription {
    tradeOrderUpdated {
        buyOrders{
            type
            price
            quantity
            }
            sellOrders{
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

const TestTrading = () => {
    const [currentTab, setCurrentTab] = useState('BUY');
    const [tradeHistory, setTradeHistory] = useState([]);
    const [buyOrders, setBuyOrders] = useState([]);
    const [sellOrders, setSellOrders] = useState([]);
    const { data: newOrderData } = useSubscription(TRADE_ORDER_UPDATED_SUBSCRIPTION);

    useEffect(() => {
        // Fetch trade orders when the component mounts
        fetchTradeOrdersData();
        console.log('first time data')

    }, []);

    useEffect(() => {
        // Update trade data when new order data is received

        if (newOrderData) {
            setTradeHistory(newOrderData.tradeOrderUpdated.tradeHistory);
            setBuyOrders(newOrderData.tradeOrderUpdated.buyOrders);
            setSellOrders(newOrderData.tradeOrderUpdated.sellOrders);
            console.log(newOrderData)
            console.log('this print typeof ', typeof newOrderData)

        }
    }, [newOrderData]);

    const fetchTradeOrdersData = () => {
        fetchTradeOrders()
            .then(data => {
                setTradeHistory(data.tradeOrders.tradeHistory);
                setBuyOrders(data.tradeOrders.buyOrders);
                setSellOrders(data.tradeOrders.sellOrders);
            })
            .catch(error => console.error("Failed to fetch trade orders", error));
    };

    return (
        <Row>
            <div className="col-xl-7">
                <div className="row">
                    <div className="col-xl-12">
                        <div className="card h-auto">
                            <div className="card-body px-0 pt-1">
                                <Tab.Container defaultActiveKey={currentTab} onSelect={(k) => setCurrentTab(k)}>
                                    <div>
                                        <div className="buy-sell">
                                            <Nav className="nav nav-tabs" eventKey="nav-tab2" role="tablist">
                                                <Nav.Link as="button" className="nav-link" eventKey="BUY" type="button">buy</Nav.Link>
                                                <Nav.Link as="button" className="nav-link" eventKey="SELL" type="button">sell</Nav.Link>
                                            </Nav>
                                        </div>
                                    </div>
                                    <Tab.Content>
                                        <Tab.Pane eventKey="BUY">
                                            <Tab.Container defaultActiveKey="Navbuylimit">
                                                <div className="limit-sell">
                                                    <Nav className="nav nav-tabs" role="tablist">
                                                        <Nav.Link as="button" eventKey="Navbuylimit">Limit Order</Nav.Link>
                                                        <Nav.Link as="button" eventKey="Navbuymarket">Market Order</Nav.Link>
                                                    </Nav>
                                                </div>
                                                <Tab.Content>
                                                    <Tab.Pane eventKey="Navbuylimit">
                                                        <div className="sell-element">
                                                            <LimitOrder onTradeSuccess={fetchTradeOrdersData} />
                                                        </div>
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey="Navbuymarket">
                                                        <div className="sell-element">

                                                            <MarketOrder />
                                                        </div>

                                                    </Tab.Pane>
                                                </Tab.Content>
                                            </Tab.Container>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="SELL">
                                            <Tab.Container defaultActiveKey="Navselllimit">
                                                <div className="limit-sell">
                                                    <Nav className="nav nav-tabs" role="tablist">
                                                        <Nav.Link as="button" eventKey="Navselllimit">Limit Order</Nav.Link>
                                                        <Nav.Link as="button" eventKey="Navsellmarket">Market Order</Nav.Link>
                                                    </Nav>
                                                </div>
                                                <Tab.Content>
                                                    <Tab.Pane eventKey="Navselllimit">
                                                        <div className="sell-element">
                                                            <LimitOrder currentTab={currentTab} onTradeSuccess={fetchTradeOrdersData} />
                                                        </div>
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey="Navsellmarket">
                                                        <div className="sell-element">
                                                            <MarketOrder currentTab={currentTab} />
                                                        </div>
                                                    </Tab.Pane>
                                                </Tab.Content>
                                            </Tab.Container>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Tab.Container>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-header py-2">
                                <h2 className="heading">Order Book</h2>
                            </div>
                            <div className="card-body pt-0 pb-3 px-2">
                                <div>
                                    <div>
                                        <div className="list-row-head">
                                            <span className="text-white">Quantity</span>
                                            <span className="text-end text-white">BUY PRICE</span>
                                            <span className="text-white">SELL PRICE</span>
                                            <span className="text-end text-white">Quantity</span>
                                        </div>
                                        <div className="list-table danger">
                                            {/* Assuming buyOrders and sellOrders are of equal length or padded appropriately */}
                                            {buyOrders.map((buyOrder, index) => {
                                                const sellOrder = sellOrders[index] || {};
                                                return (
                                                    <div className="list-row" key={index}>
                                                        <span >{buyOrder.quantity}</span>
                                                        <span className="text-end">{buyOrder.price}</span>
                                                        <span>{sellOrder.price || ""}</span>
                                                        <span className="text-end text-danger">{sellOrder.quantity || ""}</span>
                                                        <div className="bg-layer"></div>
                                                    </div>
                                                );
                                            })}
                                            {/* Optionally handle any additional sell orders if sellOrders.length > buyOrders.length */}
                                            {sellOrders.slice(buyOrders.length).map((sellOrder, index) => (
                                                <div className="list-row" key={`sell-${index}`}>
                                                    <span></span> {/* Empty for alignment */}
                                                    <span></span> {/* Empty for alignment */}
                                                    <span >{sellOrder.price}</span>
                                                    <span className="text-end">{sellOrder.quantity}</span>
                                                    <div className="bg-layer"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="col-xl-5 ">
                <div className="card">
                    <div className="card-header py-2">
                        <h2 className="heading">Trade History</h2>
                    </div>
                    <div className="card-body pt-0 pb-3 px-2">
                        <div >
                            <div>
                                <div  >
                                    <div className="list-row-head">
                                        <span className="text-white">Price</span>
                                        <span className="text-white">Quantity</span>
                                        <span className="text-end text-white">Total</span>
                                    </div>
                                    <div className="list-table danger">
                                        {tradeHistory.map((order, index) => (
                                            <div className="list-row" key={index}>
                                                <span>{order.price}</span>
                                                <span>{order.quantity}</span>
                                                <span className="text-end">{order.price * order.quantity}</span>
                                                {/* Calculate total based on price and quantity */}
                                                <div className="bg-layer"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Row>
    )
}

export default TestTrading;