import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async ({ type, category, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (type && type !== "all") params.append("type", type);
      if (category && category !== "all") params.append("category", category);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(`/api/items?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch items");

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItem = createAsyncThunk(
  "items/addItem",
  async (itemData, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (!res.ok) throw new Error("Failed to add item");
      const data = await res.json();
      return data.data; // Return the item data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminItems = createAsyncThunk(
  "items/fetchAdminItems",
  async ({ page = 1, limit = 20, type, category } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (type && type !== "all") params.append("type", type);
      if (category && category !== "all") params.append("category", category);

      const res = await fetch(`/api/admin?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Admin fetch failed");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItemAdmin = createAsyncThunk(
  "items/deleteItemAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/admin/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveItemAdmin = createAsyncThunk(
  "items/resolveItemAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/admin/${id}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Resolve failed");
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const itemsSlice = createSlice({
  name: "items",
  initialState: {
    list: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20,
      hasNextPage: false,
      hasPrevPage: false,
    },
    status: "idle",
    error: null,
  },
  reducers: {
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(addItem.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.pagination.totalItems += 1;
      })

      .addCase(fetchAdminItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAdminItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })

      .addCase(deleteItemAdmin.fulfilled, (state, action) => {
        state.list = state.list.filter(item => item._id !== action.payload);
        state.pagination.totalItems -= 1;
      })
      .addCase(resolveItemAdmin.fulfilled, (state, action) => {
        const item = state.list.find(i => i._id === action.payload);
        if (item) item.type = "resolved";
      });
  },
});

export const { setPage } = itemsSlice.actions;
export default itemsSlice.reducer;
