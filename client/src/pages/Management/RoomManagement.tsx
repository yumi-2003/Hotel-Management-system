import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getAllRooms,
  updateRoomStatus,
  createRoom,
} from "../../services/individualRoomService";
import { getAllRoomTypes } from "../../services/roomService";
import type { Room, RoomType } from "../../types";
import {
  Plus,
  CheckCircle2,
  Wrench,
  Search,
  Loader2,
  Key,
  Info,
  Layers,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);

  // New room form state
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    roomType: "",
    floor: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, typesData] = await Promise.all([
        getAllRooms({
          status: statusFilter || undefined,
          page: currentPage,
          limit: 10,
        }),
        getAllRoomTypes({ limit: 100 }),
      ]);
      setRooms(roomsData.rooms || []);
      setTotalPages(roomsData.pagination?.totalPages || 1);
      setTotalRooms(roomsData.pagination?.totalRooms || 0);
      setRoomTypes(typesData.roomTypes);
      if (typesData.roomTypes.length > 0 && !newRoom.roomType) {
        setNewRoom((prev) => ({
          ...prev,
          roomType: typesData.roomTypes[0]._id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, currentPage]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateRoomStatus(id, newStatus);
      setRooms(
        rooms.map((r) =>
          r._id === id ? { ...r, status: newStatus as any } : r,
        ),
      );
    } catch (error) {
      console.error("Failed to update room status", error);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await createRoom(newRoom);
      setRooms([...rooms, added]);
      setShowAddModal(false);
      setNewRoom({
        roomNumber: "",
        roomType: roomTypes[0]?._id || "",
        floor: 1,
      });
      toast.success("Room added successfully!");
    } catch (error) {
      console.error("Failed to add room", error);
      toast.error(
        "Failed to add room. Please check if room number already exists.",
      );
    }
  };

  const filtered = rooms.filter((r) => {
    const typeLabel = typeof r.roomType === "object" ? r.roomType.typeName : "";
    return (
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-200";
      case "OCCUPIED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "MAINTENANCE":
        return "bg-red-100 text-red-700 border-red-200";
      case "RESERVED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Key className="text-spa-teal" /> Room Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage individual rooms and their operational status
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-spa-teal hover:bg-spa-teal-dark text-white rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Add Individual Room
        </Button>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by room number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border focus:border-spa-teal outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-white outline-none focus:border-spa-teal"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
            <option value="cleaning">Cleaning</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Room No.</th>
                <th className="px-6 py-4">Room Type</th>
                <th className="px-6 py-4">Floor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-spa-teal"
                      size={32}
                    />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No rooms found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-black text-lg text-[#0F2F2F]">
                        {r.roomNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0F2F2F]">
                        {typeof r.roomType === "object"
                          ? r.roomType.typeName
                          : "Room Type"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Layers size={14} /> <span>{r.floor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(r.status)}`}
                      >
                        {r.status === "available" && <CheckCircle2 size={10} />}
                        {r.status === "occupied" && <Info size={10} />}
                        {r.status === "maintenance" && <Wrench size={10} />}
                        {r.status === "cleaning" && <Clock size={10} />}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleStatusUpdate(r._id, e.target.value)
                        }
                        className="text-xs font-bold bg-transparent border-none text-spa-teal cursor-pointer focus:ring-0"
                      >
                        <option value="available">Set Available</option>
                        <option value="maintenance">Set Maintenance</option>
                        <option value="reserved">Set Reserved</option>
                        <option value="cleaning">Set Cleaning</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-slate-50/50">
          <div className="text-sm text-muted-foreground">
            Showing {rooms.length} of {totalRooms} rooms
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

      {/* Add Room Modal (Simple) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-[#0F2F2F] mb-6">
              Add Individual Room
            </h2>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">
                  Room Number
                </label>
                <input
                  required
                  type="text"
                  value={newRoom.roomNumber}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, roomNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-spa-teal outline-none"
                  placeholder="e.g. 101, 204A"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">
                  Room Type
                </label>
                <select
                  required
                  value={newRoom.roomType}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, roomType: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-spa-teal outline-none bg-white"
                >
                  {roomTypes.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.typeName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">
                  Floor
                </label>
                <input
                  required
                  type="number"
                  value={newRoom.floor}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-spa-teal outline-none"
                  min="1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-spa-teal text-white">
                  Add Room
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
