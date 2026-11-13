import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { deleteProduct } from "../../redux/actions/product";
import { AiOutlinePlus } from "react-icons/ai";
import { productData } from "../../static/data";
import { getProductImage, onImgError } from "../../utils/image";

const AllProducts = () => {
  const { products, isLoading, error } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);

  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    window.location.reload();
  };

  const columns = [
    { field: "id", headerName: "Product Id", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Name",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "Stock",
      headerName: "Stock",
      type: "number",
      minWidth: 80,
      flex: 0.5,
    },

    {
      field: "sold",
      headerName: "Sold out",
      type: "number",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: "Preview",
      flex: 0.8,
      minWidth: 100,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/product/${params.id}`}>
              <Button>
                <AiOutlineEye size={20} />
              </Button>
            </Link>
          </>
        );
      },
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Button onClick={() => handleDelete(params.id)}>
              <AiOutlineDelete size={20} />
            </Button>
          </>
        );
      },
    },
  ];

  const row = [];

  products &&
    products.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: "US$ " + item.discountPrice,
        Stock: item.stock,
        sold: item?.sold_out,
      });
    });

  return (
    <div className="w-full mx-8 pt-6">
      <section>
        <h2 className="mb-4 text-xl font-semibold">Your Shop Products</h2>
        {error ? (
          <p className="mb-4 text-red-600" role="alert">
            Could not load your shop products: {error}
          </p>
        ) : products?.length ? (
          <div className="bg-white">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
          </div>
        ) : (
          <div className="rounded bg-white p-6 text-center">
            <h3 className="font-semibold">No products in your shop yet</h3>
            <p className="mt-2 text-gray-600">
              Create a product to add it to your shop.
            </p>
            <Link
              to="/dashboard-create-product"
              className="inline-flex items-center gap-2 mt-4 rounded bg-blue-600 px-4 py-2 text-white"
            >
              <AiOutlinePlus />
              Create Product
            </Link>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Demo Catalog (Read Only)</h2>
        <p className="mb-4 mt-1 text-sm text-gray-600">
          Sample storefront products for preview. These are not saved to your
          shop and cannot be edited or deleted from this list.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productData.map((item) => (
            <Link
              to={`/product/${item.id}`}
              key={item.id}
              className="rounded bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <img
                src={getProductImage(item)}
                onError={onImgError}
                alt={item.name}
                className="h-40 w-full rounded object-contain"
              />
              <h3 className="mt-3 font-medium">{item.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.category}</p>
              <p className="mt-2 font-semibold">
                ${item.discount_price ?? item.price}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AllProducts;