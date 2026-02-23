import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRoomTypes, deleteRoomType } from "../../services/roomService";
import {
  getRoomCountByType,
  createMultipleRooms,
} from "../../services/individualRoomService";
import type { RoomType } from "../../types";
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Star,
  Users,
  Layers,
  PlusCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";

const RoomTypeManagement = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    null,
  );
  const [bulkForm, setBulkForm] = useState({
    count: 1,
    startRoomNumber: 100,
    floor: 1,
  });
  const [creating, setCreating] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoomTypes, setTotalRoomTypes] = useState(0);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const [typesData, countsData] = await Promise.all([
        getAllRoomTypes({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
        }),
        getRoomCountByType(),
      ]);
      setRoomTypes(typesData.roomTypes);
      setTotalPages(typesData.pages || 1);
      setTotalRoomTypes(typesData.total || 0);

      // Convert array of {_id, count} to object
      const countsObj: Record<string, number> = {};
      countsData.forEach((item: any) => {
        countsObj[item._id] = item.count;
      });
      setRoomCounts(countsObj);
    } catch (error) {
      console.error("Failed to fetch room types", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchRoomTypes();
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this room type (soft delete)?",
      )
    )
      return;
    try {
      await deleteRoomType(id);
      setRoomTypes(roomTypes.filter((rt) => rt._id !== id));
      toast.success("Room type deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete room type", error);
      toast.error("Failed to delete room type");
    }
  };

  const handleCreateRooms = async () => {
    if (!selectedRoomType) return;

    try {
      setCreating(true);
      await createMultipleRooms({
        roomTypeId: selectedRoomType._id,
        count: bulkForm.count,
        startRoomNumber: bulkForm.startRoomNumber,
        floor: bulkForm.floor,
      });

      toast.success(
        `${bulkForm.count} rooms created successfully for ${selectedRoomType.typeName}`,
      );
      setShowBulkModal(false);
      setSelectedRoomType(null);
      setBulkForm({ count: 1, startRoomNumber: 100, floor: 1 });

      // Refresh room counts
      await fetchRoomTypes();
    } catch (error: any) {
      console.error("Failed to create rooms", error);
      toast.error(error?.response?.data?.message || "Failed to create rooms");
    } finally {
      setCreating(false);
    }
  };

  const openBulkModal = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setShowBulkModal(true);
  };

  const filtered = roomTypes.filter((rt) =>
    rt.typeName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Home className="text-spa-teal" /> Room Type Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure room categories, pricing, and availability
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/rooms/new")}
          className="bg-spa-teal hover:bg-spa-teal-dark text-white rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Add Room Type
        </Button>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-slate-50/50">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Filter by type name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border focus:border-spa-teal outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="col-span-full py-12 text-center">
              <Loader2
                className="animate-spin mx-auto text-spa-teal"
                size={32}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No room types found.
            </div>
          ) : (
            filtered.map((rt) => (
              <div
                key={rt._id}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <img
                    src={
                      rt.images?.[0] ||
                      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={rt.typeName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star
                      size={12}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-xs font-bold">
                      {rt.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-[#0F2F2F]">
                      {rt.typeName}
                    </h3>
                    <div className="text-spa-teal font-black">
                      ${rt.basePrice}
                      <span className="text-xs font-bold text-muted-foreground">
                        /nt
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users size={14} />{" "}
                      <span>
                        {rt.maxAdults}A, {rt.maxChildren}C
                      </span>
                    </div>
                    <div className="bg-spa-mint/10 text-spa-teal px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {rt.bedType}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Layers size={14} />
                      <span>{roomCounts[rt._id] || 0} rooms</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/rooms/edit/${rt._id}`)}
                        className="text-spa-teal hover:bg-spa-teal/5 font-bold flex items-center gap-1.5"
                      >
                        <Edit2 size={14} /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBulkModal(rt)}
                        className="text-blue-600 hover:bg-blue-50 font-bold flex items-center gap-1.5"
                      >
                        <PlusCircle size={14} /> Create Rooms
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rt._id)}
                      className="text-red-500 hover:bg-red-50 font-bold flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bulk Room Creation Modal */}
      {showBulkModal && selectedRoomType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#0F2F2F] mb-4">
              Create Rooms for {selectedRoomType.typeName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkForm.count}
                  onChange={(e) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      count: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Room Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkForm.startRoomNumber}
                  onChange={(e) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      startRoomNumber: parseInt(e.target.value) || 100,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkForm.floor}
                  onChange={(e) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      floor: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-teal focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowBulkModal(false)}
                variant="outline"
                className="flex-1"
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRooms}
                className="flex-1 bg-spa-teal hover:bg-spa-teal-dark"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2" size={16} />
                    Create Rooms
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-slate-50/50">
          <div className="text-sm text-muted-foreground">
            Showing {roomTypes.length} of {totalRoomTypes} room types
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeManagement;
