"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Button,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { itemApi } from "@/lib/api";
import { Item } from "@/lib/types";

interface ItemListProps {
  isAdmin?: boolean;
}

/**
 * ItemList Component
 *
 * Displays a list of items, either all items (admin view) or only the user's items.
 *
 * @param isAdmin Whether to show all items (admin view)
 */
export default function ItemList({ isAdmin = false }: ItemListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Use the appropriate API call based on user role
        const response = isAdmin
          ? await itemApi.getAllItems()
          : await itemApi.getUserItems();

        if (response.data) {
          setItems(response.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError("Failed to fetch items");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isAdmin]);

  // Handle item deletion
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await itemApi.deleteItem(id);
        if (!response.error) {
          // Remove the deleted item from the state
          setItems(items.filter(item => item.id !== id));
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError("Failed to delete item");
        console.error(err);
      }
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          {isAdmin ? "All Items" : "Your Items"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/items/new"
        >
          Create New Item
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {isAdmin ? "No items found in the system." : "You have not created any items yet."}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/items/new"
            sx={{ mt: 2 }}
          >
            Create Your First Item
          </Button>
        </Paper>
      ) : (
        <Paper elevation={1}>
          <List>
            {items.map((item) => (
              <ListItem
                key={item.id}
                divider
                secondaryAction={
                  <Box>
                    <Tooltip title="View">
                      <IconButton
                        edge="end"
                        aria-label="view"
                        onClick={() => router.push(`/items/${item.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => router.push(`/items/${item.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={item.title}
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: "80%" }}
                    >
                      {item.description || "No description"}
                    </Typography>
                  }
                />
                {isAdmin && (
                  <Chip
                    label={`Owner: ${item.owner_id.substring(0, 8)}...`}
                    size="small"
                    color="info"
                    sx={{ mr: 8 }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
