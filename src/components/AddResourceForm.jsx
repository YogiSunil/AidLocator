import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addResource,
  clearResourceError,
  editResource,
  deleteResource,
} from "../features/resources/resourceSlice";

const AddResourceForm = () => {
  const dispatch = useDispatch();
  const resourceError = useSelector((state) => state.resources.error);

  const [form, setForm] = useState({
    type: "food",
    name: "",
    address: "",
    city: "",
    state: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue =
      name === "city" || name === "state"
        ? value.replace(/\b\w/g, (char) => char.toUpperCase())
        : value;

    setForm((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleAddResource = (resource) => {
    dispatch(addResource(resource));
  };

  const handleEditResource = (resourceId, updatedResource) => {
    dispatch(editResource({ resourceId, updatedResource }));
  };

  const handleDeleteResource = (resourceId) => {
    dispatch(deleteResource(resourceId));
  };

  useEffect(() => {
    if (resourceError) {
      const timeout = setTimeout(() => {
        dispatch(clearResourceError());
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [resourceError, dispatch]);

  return (
    <div className="bg-black p-4 rounded-md shadow-md max-w-md mx-auto mt-4 text-white">
      <h2 className="text-xl font-semibold mb-4">Add Resource</h2>
      {resourceError && <p className="text-red-400 mb-2">{resourceError}</p>}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleAddResource(form);
      }} className="space-y-3">
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full p-2 bg-white text-black rounded-md"
        >
          <option value="food">Food</option>
          <option value="shelter">Shelter</option>
          <option value="water">Water</option>
          <option value="donation">Donation</option>
        </select>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Resource Name"
          className="w-full p-2 bg-white text-black rounded-md"
        />
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Street Address"
          className="w-full p-2 bg-white text-black rounded-md"
        />
        <input
          type="text"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City"
          className="w-full p-2 bg-white text-black rounded-md"
        />
        <input
          type="text"
          name="state"
          value={form.state}
          onChange={handleChange}
          placeholder="State"
          className="w-full p-2 bg-white text-black rounded-md"
        />
        <button
          type="submit"
          className="bg-white text-black rounded-md px-4 py-2 hover:bg-gray-200"
        >
          Submit
        </button>
      </form>
      <button
        onClick={() => handleEditResource(1, { name: "Updated Resource" })}
        className="mt-4 bg-yellow-500 text-black rounded-md px-4 py-2 hover:bg-yellow-600"
      >
        Edit Resource
      </button>
      <button
        onClick={() => handleDeleteResource(1)}
        className="mt-4 bg-red-500 text-white rounded-md px-4 py-2 hover:bg-red-600"
      >
        Delete Resource
      </button>
    </div>
  );
};

export default AddResourceForm;
