import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "../Route/ProductCard/ProductCard";
import { productData } from "../../static/data";

const RelatedProducts = ({ category, excludeId }) => {
  const allProducts = useSelector((state) => state.products.allProducts || []);
  const relatedProducts = [...allProducts, ...productData]
    .filter((product) => {
      const productCategory =
        product.category || product.categoryName || product.category_type;
      const productId = product._id || product.id;
      return (
        productCategory === category &&
        String(productId) !== String(excludeId)
      );
    })
    .slice(0, 8);

  if (!category) {
    return null;
  }

  return (
    <div className="w-full mt-10">
      <h3 className="text-[25px] font-[600] border-b pb-2">Related Product</h3>

      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:gap-[30px] mb-12 mt-5">
        {relatedProducts.length > 0 ? (
          relatedProducts.map((product) => (
            <ProductCard
              data={product}
              key={product._id || product.id}
            />
          ))
        ) : (
          <p className="text-gray-500">No related products available.</p>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
