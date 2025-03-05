"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon } from "@mui/icons-material";

import { itemApi } from "@/lib/api";
import { Item } from "@/lib/types";

/**
 * Item Detail Page
 *
 * Shows the details of a specific item.
 *
 * @returns The item detail page component
 */
export default function ItemDetailPage() {
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

  // Handle item deletion
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await itemApi.deleteItem(itemId);
        if (!response.error) {
          // Redirect to items list on success
          router.push("/items");
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError("Failed to delete item");
        console.error(err);
      }
    }
  };

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
          onClick={() => router.push("/items")}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Item Details
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            {item.title}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/items/${itemId}/edit`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold">
          Description:
        </Typography>
        <Typography variant="body1" paragraph>
          {item.description || "No description provided."}
        </Typography>

        <Box mt={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Item ID: {item.id}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Owner ID: {item.owner_id}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
