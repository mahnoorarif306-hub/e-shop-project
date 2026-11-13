import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductDetails from "../components/Products/ProductDetails.jsx";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { getAllProducts } from "../redux/actions/product";
import { eventData, productData } from "../static/data";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { allProducts, allProductsLoaded, allProductsError, isLoading } =
    useSelector((state) => state.products);
  const staticProduct = productData.find(
    (item) => String(item.id ?? item._id) === String(id)
  ) || eventData.find((item) => String(item.id ?? item._id) === String(id));
  const product =
    staticProduct ||
    allProducts.find(
      (item) => String(item._id ?? item.id) === String(id)
    ) ||
    null;

  useEffect(() => {
    if (!staticProduct && !allProductsLoaded) {
      dispatch(getAllProducts());
    }
  }, [dispatch, id, allProductsLoaded, staticProduct]);

  return (
    <div>
      <Header />
      {product ? (
        <ProductDetails data={product} />
      ) : isLoading && !allProductsLoaded ? (
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-lg text-gray-600">Loading product...</p>
        </div>
      ) : allProductsError ? (
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-lg text-red-600">{allProductsError}</p>
        </div>
      ) : (
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-lg text-gray-600">Product not found.</p>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
