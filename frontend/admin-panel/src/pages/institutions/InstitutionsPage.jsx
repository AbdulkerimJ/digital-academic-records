import { useState, useEffect } from "react"
import FetchingIndicator from "../../components/common/FetchingIndicator"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { listInstitutions, listInstitutionTypes, deleteInstitution, updateInstitution } from "../../api/institutions.api"
import { Button } from "../../components/ui/button"
import { Plus, Building2, Activity, Clock, AlertTriangle, ShieldCheck } from "lucide-react"
import { Card } from "../../components/ui/card"
import { toast } from "sonner"

import InstitutionFilters from "./InstitutionFilters"
import InstitutionTable from "./InstitutionTable"
import InstitutionModal from "./InstitutionModal"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import useDebounce from "../../hooks/useDebounce"
import { useSearchParams } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function InstitutionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [institutionToEdit, setInstitutionToEdit] = useState(null)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [institutionToDelete, setInstitutionToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!institutionToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteInstitution(institutionToDelete.id)
      toast.success("Record deleted.")
      queryClient.invalidateQueries(["institutions"])
      setIsDeleteModalOpen(false)
      setInstitutionToDelete(null)
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (institution) => {
    try {
      await updateInstitution(institution.id, { isActive: !institution.isActive })
      toast.success(`${institution.name} ${institution.isActive ? 'deactivated' : 'activated'}.`)
      queryClient.invalidateQueries(["institutions"])
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed")
    }
  }
  
  const searchTerm = searchParams.get("search") || ""
  const debouncedSearch = useDebounce(searchTerm, 500)
  const typeFilter = searchParams.get("type") || "all"
  const statusFilter = searchParams.get("status") || "all"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)
  const sortBy = searchParams.get("sortBy") || "name"
  const sortDir = searchParams.get("sortDir") || "ASC"

  const setPage = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", newPage.toString())
    setSearchParams(newParams)
  }

  const setLimit = (newLimit) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("limit", newLimit.toString())
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || !value) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  const setSort = (field) => {
    const newParams = new URLSearchParams(searchParams)
    if (sortBy === field) {
      newParams.set("sortDir", sortDir === "ASC" ? "DESC" : "ASC")
    } else {
      newParams.set("sortBy", field)
      newParams.set("sortDir", "ASC")
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const { data: instData, error, isFetching } = useQuery({
    queryKey: ["institutions", { page, limit, sortBy, sortDir, searchTerm: debouncedSearch, typeFilter, statusFilter }],
    queryFn: () => listInstitutions({ 
      page, 
      limit, 
      offset: (page - 1) * limit,
      sortBy, 
      sortDir, 
      search: debouncedSearch, 
      type: typeFilter, 
      status: statusFilter 
    })
  })

  const { data: typesData } = useQuery({
    queryKey: ["institution-types"],
    queryFn: listInstitutionTypes
  })

  const institutions = Array.isArray(instData?.data?.institutions) ? instData.data.institutions : []
  const totalCount = instData?.data?.count || 0
  const institutionTypes = Array.isArray(typesData?.data?.types) ? typesData.data.types : []

  if (error) return (
    <Card className="p-12 flex flex-col items-center justify-center text-center border-destructive/20 bg-destructive/5 rounded-none">
      <AlertTriangle size={48} className="text-destructive mb-4" />
      <h3 className="text-sm font-black capitalize tracking-widest text-destructive mb-2">Error Loading Data</h3>
      <p className="text-xs font-bold text-muted-foreground capitalize opacity-70">{error.response?.data?.message || error.message}</p>
    </Card>
  )

  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. Header (Keep Uppercase) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-border pb-2">
        <div className="space-y-1 text-left">

          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground capitalize leading-none">
            Institution <span className="text-primary">List</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs tracking-tight opacity-70">
            Manage partner universities and academic boards.
          </p>
        </div>
        
        <Button 
          onClick={() => {
            setInstitutionToEdit(null)
            setIsModalOpen(true)
          }} 
          className="rounded-none h-11 px-8 gap-3 font-bold text-xs shadow-xl shadow-primary/20 hover:brightness-110 transition-all"
        >
          <Plus size={14} /> Add institution
        </Button>
      </div>

      {/* 2. Filters */}
      <InstitutionFilters 
        searchTerm={searchTerm}
        setSearchTerm={(val) => updateFilters({ search: val })}
        typeFilter={typeFilter}
        setTypeFilter={(val) => updateFilters({ type: val })}
        statusFilter={statusFilter}
        setStatusFilter={(val) => updateFilters({ status: val })}
        onClear={clearFilters}
        institutionTypes={institutionTypes}
      />

      {/* 3. Data Table */}
      <div className="bg-card border border-border shadow-sm p-1">
        <InstitutionTable 
          institutions={institutions}
          totalCount={totalCount}
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={limit}
          onItemsPerPageChange={setLimit}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={setSort}
          isFiltered={searchTerm || typeFilter !== "all" || statusFilter !== "all"}
          isFetching={isFetching}
          onEdit={(inst) => {
            setInstitutionToEdit(inst)
            setIsModalOpen(true)
          }}
          onDelete={(inst) => {
            setInstitutionToDelete(inst)
            setIsDeleteModalOpen(true)
          }}
          onToggleStatus={handleToggleStatus}
          onAdd={() => setIsModalOpen(true)}
          onClearFilters={clearFilters}
        />
      </div>

      <InstitutionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setInstitutionToEdit(null)
        }} 
        institution={institutionToEdit}
        institutionTypes={institutionTypes}
      />

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setInstitutionToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete record"
        description={`Are you sure you want to delete ${institutionToDelete?.name}? This action will be logged.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
