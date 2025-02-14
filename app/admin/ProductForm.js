// components/admin/ProductForm.js
export function ProductForm({ onSubmit, initialData, loading }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      price: "",
      category: "",
      type: "",
      description: "",
      shopeeLink: "",
      isBestSeller: false,
    }
  );
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initialData?.image || "");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData, image);
    if (!initialData) {
      setFormData({
        name: "",
        price: "",
        category: "",
        type: "",
        description: "",
        shopeeLink: "",
        isBestSeller: false,
      });
      setImage(null);
      setPreview("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : "Save Product"}
      </Button>
    </form>
  );
}
