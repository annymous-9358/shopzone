import React, { useState, useEffect } from "react";
import { useCartStore } from "../store/useCartStore";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { fetchProducts } from "../services/api";

const Checkout = () => {
  const { items, clearCart, fetchCart } = useCartStore();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
  });
  const [addresses, setAddresses] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [editAddressMode, setEditAddressMode] = useState(false);
  const navigate = useNavigate();

  const getUserId = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      const response = await api.get("api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data;
      return userData.id; // Adjust based on your API response structure
    } catch (error) {
      console.error("Failed to retrieve user ID:", error);
      return null;
    }
  };

  useEffect(() => {
    const initializeCart = async () => {
      try {
        await fetchCart(); // Fetch cart first
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };
    initializeCart();
  }, []); // Run once on component mount

  useEffect(() => {
    const loadCartDetails = async () => {
      try {
        if (items && items.length > 0) {
          const productsData = await fetchProducts();
          console.log("Cart items:", items);
          const cartProductDetails = items.map((cartItem) => {
            const product = productsData.find(
              (p) => p.id === cartItem.productId
            );
            return {
              ...cartItem,
              image: product.image,
              title: product.title,
              price: product.price,
            };
          });
          console.log("Mapped product details:", cartProductDetails);
          setProductDetails(cartProductDetails);
        } else {
          console.log("No items in cart");
          setProductDetails([]);
        }
      } catch (error) {
        console.error("Failed to load cart details:", error);
      }
    };
    loadCartDetails();
  }, [items]); // Run whenever items change

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("api/users/profile");
        const userData = response.data;
        setAddresses(userData.addresses);
        if (userData.addresses.length > 0) {
          setAddress(userData.addresses[0]); // Set the first address as default
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    console.log("Cart items updated:", items);
  }, [items]);

  useEffect(() => {
    console.log("Addresses updated:", addresses);
  }, [addresses]);

  console.log("Current addresses:", addresses);

  const handlePlaceOrder = async () => {
    try {
      // Retrieve authenticated user ID
      const userId = await getUserId();

      // Create order data
      const orderData = {
        items: productDetails.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.title,
          image: item.image,
        })),
        totalAmount: productDetails.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
        },
        trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}`,
      };

      console.log("Order Data:", orderData);

      // Send order data to backend
      const response = await api.post("api/orders", orderData);
      if (response.status === 201) {
        console.log("Order placed successfully:", response.data);
        alert("Order placed successfully!");
        clearCart();
        console.log("Cart cleared");
        await api.delete("api/cart/drop", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Cart items removed from database");
        navigate("/orders", { state: { orderDetails: response.data } });
      } else {
        console.error("Failed to place order:", response.data);
      }
    } catch (error) {
      console.error("Error during order placement:", error);
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await api.post("api/users/profile/address", newAddress);
      const { addresses: updatedAddresses } = response.data;
      if (updatedAddresses && updatedAddresses.length > 0) {
        const newAddress = updatedAddresses[updatedAddresses.length - 1];
        setAddresses(updatedAddresses);
        setNewAddress({
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        });
        setAddress(newAddress);
        setEditAddressMode(false);
        console.log("Address added and updated:", newAddress);
        console.log("Updated addresses:", updatedAddresses);
      } else {
        console.error("Invalid address data:", response.data);
      }
    } catch (error) {
      console.error("Failed to add new address:", error);
    }
  };

  const handleAddressSelect = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "new") {
      setEditAddressMode(true);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      });
    } else {
      const selectedAddress = addresses.find(
        (addr) => addr.street === selectedValue
      );
      if (selectedAddress) {
        setAddress(selectedAddress);
      }
      setEditAddressMode(false);
    }
    console.log("Selected address:", selectedValue);
    console.log("Edit Address Mode:", editAddressMode);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Order Summary
        </h3>
        <ul className="space-y-4">
          {productDetails && productDetails.length > 0 ? (
            productDetails.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-contain mr-4"
                />
                <span className="flex-1 text-lg font-medium text-gray-900">
                  {item.title}
                </span>
                <span className="text-lg font-medium text-gray-900">
                  ${item.price}
                </span>
                <span className="text-lg font-medium text-gray-900">
                  x {item.quantity}
                </span>
              </li>
            ))
          ) : (
            <p>No items in cart</p>
          )}
        </ul>
        <p className="text-2xl font-bold text-gray-800 mt-6">
          Total:{" "}
          {productDetails && productDetails.length > 0
            ? `$${productDetails
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toFixed(2)}`
            : "$0.00"}
        </p>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Shipping Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg shadow-md bg-white flex items-center"
            >
              <input
                type="radio"
                name="address"
                value={addr.street}
                checked={address.street === addr.street}
                onChange={handleAddressSelect}
                className="mr-2"
              />
              <span className="text-lg font-medium text-gray-800">
                {addr.street}, {addr.city}, {addr.state}, {addr.zipCode},{" "}
                {addr.country}
              </span>
            </div>
          ))}
          <div className="p-4 border rounded-lg shadow-md bg-white flex items-center">
            <input
              type="radio"
              name="address"
              value="new"
              checked={editAddressMode}
              onChange={handleAddressSelect}
              className="mr-2"
            />
            <span className="text-lg font-medium text-gray-800">
              Add New Address
            </span>
          </div>
        </div>
        {editAddressMode && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Street"
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              className="mb-2 p-2 border rounded w-full"
            />
            <input
              type="text"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress({ ...newAddress, city: e.target.value })
              }
              className="mb-2 p-2 border rounded w-full"
            />
            <input
              type="text"
              placeholder="State"
              value={newAddress.state}
              onChange={(e) =>
                setNewAddress({ ...newAddress, state: e.target.value })
              }
              className="mb-2 p-2 border rounded w-full"
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={newAddress.zipCode}
              onChange={(e) =>
                setNewAddress({ ...newAddress, zipCode: e.target.value })
              }
              className="mb-2 p-2 border rounded w-full"
            />
            <input
              type="text"
              placeholder="Country"
              value={newAddress.country}
              onChange={(e) =>
                setNewAddress({ ...newAddress, country: e.target.value })
              }
              className="mb-2 p-2 border rounded w-full"
            />
            <button
              onClick={handleAddAddress}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Add Address
            </button>
          </div>
        )}
      </div>
      <button
        onClick={handlePlaceOrder}
        className="bg-green-500 text-white px-6 py-3 rounded mt-6"
      >
        Place Order
      </button>
    </div>
  );
};

export default Checkout;
