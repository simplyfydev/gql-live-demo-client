import React, { useState } from 'react';
import { countMarketTradeValue } from '../../../apolloClientConnection/apolloClient';

const MarketOrder = ({ currentTab = 'BUY' }) => {
    const [quantity, setQuantity] = useState('');
    const [total, setTotal] = useState('');

    const handleQuantityChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
        setQuantity(value);
        // Update trade type to COIN when quantity input changes
        // Call countMarketTradeValue when the quantity changes, but only if it's not empty
        if (value.trim() !== '') {
            countMarketTradeValue('COIN', parseInt(value), currentTab)
                .then(data => {
                    // Update the total input box with the marketTradeValue
                    setTotal(data.countMarketTradeValue.toString());
                })
                .catch(error => console.error('Error retrieving market trade value:', error));
        } else {
            // Clear the total input field if quantity is empty
            setTotal('');
        }
    };

    const handleTotalChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
        setTotal(value);
        // Update trade type to INR when total input changes
        // Call countMarketTradeValue when the total changes, but only if it's not empty
        if (value.trim() !== '') {
            countMarketTradeValue('INR', parseInt(value), currentTab)
                .then(data => {
                    // Update the quantity input box with the marketTradeValue
                    setQuantity(data.countMarketTradeValue.toString());
                })
                .catch(error => console.error('Error retrieving market trade value:', error));
        } else {
            // Clear the quantity input field if total is empty
            setQuantity('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Call countMarketTradeValue when the form is submitted
        // countMarketTradeValue(currentTab, parseInt(quantity), tradeType);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="sell-blance">
                    <label className="form-label text-primary">Quantity</label>
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Quantity" value={quantity} onChange={handleQuantityChange} pattern="[0-9]*" />
                        <span className="input-group-text">COIN</span>
                    </div>
                </div>
                <div className="sell-blance">
                    <label className="form-label text-primary">Total</label>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Total"
                            value={total}
                            onChange={handleTotalChange}
                            pattern="[0-9]*"
                        />
                        <span className="input-group-text">INR</span>
                    </div>
                </div>
                <div className="slider-wrapper">
                </div>
                <div className="text-center">
                    <button type="submit" className="btn btn-primary w-75">BUY BTC</button>
                </div>
            </form>
        </>
    );
}

export default MarketOrder;