"use client";

import { Typography, Box, Button } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import ItemForm from "@/components/items/ItemForm";

/**
 * New Item Page
 *
 * Page for creating a new item.
 *
 * @returns The new item page component
 */
export default function NewItemPage() {
  const router = useRouter();

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
          Create New Item
        </Typography>
      </Box>

      <ItemForm />
    </Box>
  );
}
