import { useState } from "react";
import "./App.css";
import axios from "axios"
import {saveAs} from "file-saver"

function App() {
    const d = new Date();
    const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const [invoiceData, setInvoiceData] = useState({
        companyDetails: {
            companyName: "",
            companyAddressLine1: "",
            companyAddressLine2: "",
            companyPhone: "",
            companyEmail: "",
        },
        invoiceNo: "",
        buyerDetails: {
            buyerName: "",
            buyerAddressLine1: "",
            buyerAddressLine2: "",
            buyerPhone: "",
        },
        contactDetails: {
            contactName: "",
            deliveryAddressLine1: "",
            deliveryAddressLine2: "",
            contactPhone: "",
        },
        productList: [
            { id: "1", name: "", quantity: "", price: "", total: "" },
        ],
        amount: { subTotal: "", tax: "", total: "" },
        repDetails: {
            repName: "",
            repPhone: "",
            repEmail: "",
        },
    });

    const handleChange = (e, section, key = null) => {
        const { value } = e.target;
    
        setInvoiceData((prevData) => {
            if (section === "amount" && key === "tax") {
                const newTax = Number(value) || 0;
                const newTotal = Number(prevData.amount.subTotal) + (Number(prevData.amount.subTotal)*0.01*newTax);
                return {
                    ...prevData,
                    amount: {
                        ...prevData.amount,
                        tax: value,  
                        total: String(newTotal),
                    },
                };
            }
            return {
                ...prevData,
                [section]: key ? { ...prevData[section], [key]: value } : value,
            };
        });
    };
    

    const handleProductList = (e, index, key) => {
        const { value } = e.target;
        setInvoiceData((prevData) => {
            const updatedList = [...prevData.productList];
            updatedList[index] = {
                ...updatedList[index],
                [key]: value,
            };
            if(key === "quantity" || key ==="price"){
                updatedList[index].total = String(Number(updatedList[index].quantity)*Number(updatedList[index].price))
            }
            const newSubTotal = updatedList.reduce((sum, item) => sum + Number(item.total || 0), 0);
            const newTotal = newSubTotal + (newSubTotal*0.01*Number(prevData.amount.tax || 0));
            return { 
                ...prevData, 
                productList: updatedList,
                amount: {
                    ...prevData.amount,
                    subTotal: String(newSubTotal),
                    total: String(newTotal),
                },
            };
        })
    };

    const addProduct = () => {
        setInvoiceData((prevData) => {
            const newId = (prevData.productList.length) + 1
            return {...prevData,
            productList: [
                ...prevData.productList,
                { id: String(newId), name: "", quantity: "", price: "", total: "" },
            ],}
        });
    };

    const deleteProduct = (index) => {
        setInvoiceData((prevData) => {
            const updatedList = prevData.productList.filter((_, i) => i !== index);
            updatedList.forEach((product,index) => {
                product.id = String(index+1)
            })
            const newSubTotal = updatedList.reduce((sum, item) => sum + Number(item.total || 0), 0);
            const newTotal = newSubTotal + (newSubTotal*0.01*Number(prevData.amount.tax || 0));
            prevData.amount = {
                ...prevData.amount,
                subTotal: newSubTotal,
                total: newTotal
            }
            return { ...prevData, productList: updatedList };
        });
    };

    const downloadInvoice = async(e) => {
        e.preventDefault();
        try{
            const response = await axios.post('http://localhost:5001/invoice', invoiceData,{responseType: 'blob'})
            const pdfBlob = new Blob([response.data], {type: 'application/pdf'})
            saveAs(pdfBlob, 'invoice.pdf')
        }
        catch(err){
            window.alert(err.message)
        }
    }
    
    return (
        <form method="post" onSubmit={downloadInvoice}>
            <div className="top-section">
                <div className="company-details">
                    <h5>Company Details:</h5>
                    {Object.entries(invoiceData.companyDetails).map(([key, value]) => (
                        <input type="text" key={key} name={key} onChange={(e) => handleChange(e, "companyDetails", key)} value={value} placeholder={key}/>
                    ))}
                </div>
                <div className="invoice-details">
                    <h3>INVOICE</h3>
                    <p>
                        Invoice No. <input type="text" name="invoiceNo" onChange={(e) => handleChange(e, "invoiceNo")} value={invoiceData.invoiceNo} />
                    </p>
                    <p>Date: {date}</p>
                </div>
            </div>
            <div className="customer-details">
                <div className="billTo-details">
                    <h5>Bill To:</h5>
                    {Object.entries(invoiceData.buyerDetails).map(([key, value]) => (
                        <input type="text" key={key} name={key} onChange={(e) => handleChange(e, "buyerDetails", key)} value={value} placeholder={key}/>
                    ))}
                </div>
                <div className="shipTo-details">
                    <h5>Ship To:</h5>
                    {Object.entries(invoiceData.contactDetails).map(([key, value]) => (
                        <input type="text" key={key} name={key} onChange={(e) => handleChange(e, "contactDetails", key)} value={value} placeholder={key}/>
                    ))}
                </div>
            </div>
            <div className="product-details">
                <table>
                    <tr className="header">
                        <th>Item No.</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Total</th>
                    </tr>
                    {
                        invoiceData.productList.map((product,index) => {
                            return (
                                <tr key={index}>
                                    {Object.entries(product).map(([key,value]) => (
                                        <td key={key}><input type="text" key={key} value={value} onChange={e => handleProductList(e,index,key)}/></td>
                                    ))}
                                    <td style={{"border": "none"}}><button onClick={() => deleteProduct(index)}>X</button></td>
                                </tr>
                            )
                        })
                    }
                   <tr>
                        <td colSpan="4" style={{ textAlign: "right", border: "none", fontWeight: "bold", padding: "2px 10px" }}>Sub Total</td>
                        <td style={{ textAlign: "center", fontSize: "15px", fontWeight: "bold", padding: "2px 10px" }}>{invoiceData.amount.subTotal}</td>
                    </tr>
                    <tr>
                        <td colSpan="4" style={{ textAlign: "right", border: "none", fontWeight: "bold", padding: "2px 10px" }}>Tax</td>
                        <td style={{ textAlign: "center", fontSize: "15px", fontWeight: "bold", padding: "2px 10px" }}>
                            <input type="text" style={{ padding: "2px 10px", fontWeight: "bold", fontSize: "15px" }} value={invoiceData.amount.tax} onChange={(e) => handleChange(e, "amount", "tax")} />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4" style={{ textAlign: "right", border: "none", fontWeight: "bold", padding: "2px 10px" }}>Total</td>
                        <td style={{ textAlign: "center", fontSize: "15px", fontWeight: "bold", padding: "2px 10px" }}>{invoiceData.amount.total}</td>
                    </tr>
                </table>
                <button type="button" onClick={addProduct} className="add-product">Add Product</button>
            </div>
            <div className="rep-details">
                <h5>Representative  Details:</h5>
                {Object.entries(invoiceData.repDetails).map(([key, value]) => (
                    <input type="text" key={key} name={key} onChange={(e) => handleChange(e, "repDetails", key)} value={value} placeholder={key}/>
                ))}
            </div>
            <button type="submit" className="submit-button">Generate invoice</button>
        </form>
    );
}

export default App;
