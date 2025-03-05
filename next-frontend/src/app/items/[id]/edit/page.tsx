"use client";

import { useEffect, useState } from "react";
import { Typography, Box, Button, CircularProgress, Alert } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ArrowBack as BackIcon } from "@mui/icons-material";

import ItemForm from "@/components/items/ItemForm";
import { itemApi } from "@/lib/api";
import { Item } from "@/lib/types";

/**
 * Edit Item Page
 *
 * Page for editing an existing item.
 *
 * @returns The edit item page component
 */
export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the item ID from the URL parameters
  const itemId = Number(params.id);

  // Fetch the item details
  useEffect(() => {
    const fetchItem = async () => {
      if (isNaN(itemId)) {
        setError("Invalid item ID");
        setLoading(false);
        return;
      }

      try {
        const response = await itemApi.getItem(itemId);
        if (response.data) {
          setItem(response.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError("Failed to fetch item");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push("/items")}
          sx={{ mt: 2 }}
        >
          Back to Items
        </Button>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">Item not found</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push("/items")}
          sx={{ mt: 2 }}
        >
          Back to Items
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={router.back}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Edit Item
        </Typography>
      </Box>

      <ItemForm item={item} isEdit />
    </Box>
  );
}
