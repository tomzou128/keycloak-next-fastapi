"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";

import { itemApi } from "@/lib/api";
import { Item, ItemCreate, ItemUpdate } from "@/lib/types";

interface ItemFormProps {
  item?: Item;
  isEdit?: boolean;
}

type FormValues = {
  title: string;
  description: string;
};

/**
 * ItemForm Component
 *
 * Form for creating or editing an item using react-hook-form.
 *
 * @param item The item to edit (if editing)
 * @param isEdit Whether it's an edit form
 */
export default function ItemForm({ item, isEdit = false }: ItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);

    try {
      const itemData = {
        title: data.title,
        description: data.description,
      };

      let response;
      if (isEdit && item) {
        // Update existing item
        response = await itemApi.updateItem(item.id, itemData as ItemUpdate);
      } else {
        // Create new item
        response = await itemApi.createItem(itemData as ItemCreate);
      }

      if (response.error) {
        setError(response.error);
      } else {
        // Redirect to items list on success
        router.push("/items");
      }
    } catch (err) {
      setError("An error occurred while saving the item.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? "Edit Item" : "Create New Item"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="title"
          control={control}
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Title"
              autoFocus
              disabled={loading}
              error={!!errors.title}
              helperText={errors.title?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              multiline
              rows={4}
              disabled={loading}
              {...field}
            />
          )}
        />

        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isValid}
          >
            {loading ? <CircularProgress size={24} /> : isEdit ? "Update" : "Create"}
          </Button>

          <Button
            variant="outlined"
            onClick={() => router.push("/items")}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
