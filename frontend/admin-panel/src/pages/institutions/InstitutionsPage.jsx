import { useState, useEffect } from "react"
import FetchingIndicator from "../../components/common/FetchingIndicator"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { listInstitutions, listInstitutionTypes, deleteInstitution, updateInstitution } from "../../api/institutions.api"
import { Button } from "../../components/ui/button"
import { Plus, Building2, GraduationCap, AlertTriangle } from "lucide-react"
import { Card } from "../../components/ui/card"
import { toast } from "sonner"

import InstitutionFilters from "./InstitutionFilters"
import InstitutionTable from "./InstitutionTable"
import InstitutionModal from "./InstitutionModal"
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"
import PageLoader from "../../components/common/PageLoader"
import TableSkeleton from "../../components/common/TableSkeleton"
import useDebounce from "../../hooks/useDebounce"

import { useSearchParams } from "react-router-dom"

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
      toast.success("Institution deleted successfully")
      queryClient.invalidateQueries(["institutions"])
      setIsDeleteModalOpen(false)
      setInstitutionToDelete(null)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete institution")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (institution) => {
    try {
      await updateInstitution(institution.id, { isActive: !institution.isActive })
      toast.success(`Institution ${institution.isActive ? 'deactivated' : 'activated'} successfully`)
      queryClient.invalidateQueries(["institutions"])
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update institution status")
    }
  }
  
  // Filter & Pagination derived from searchParams
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

  const { data: instData, isLoading, error, isFetching } = useQuery({
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

  const institutionsRaw = instData?.data?.institutions
  const institutions = Array.isArray(institutionsRaw) ? institutionsRaw : []
  const totalCount = instData?.data?.count || 0
  const institutionTypesRaw = typesData?.data?.types
  const institutionTypes = Array.isArray(institutionTypesRaw) ? institutionTypesRaw : []

  // Predictive Prefetching for next/prev pages
  useEffect(() => {
    const totalPages = Math.ceil(totalCount / limit)
    const commonParams = { 
      limit, 
      sortBy, 
      sortDir, 
      search: debouncedSearch, 
      type: typeFilter, 
      status: statusFilter 
    }
    
    // Prefetch Next Page
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["institutions", { ...commonParams, page: page + 1, offset: page * limit }],
        queryFn: () => listInstitutions({ ...commonParams, page: page + 1, offset: page * limit })
      })
    }

    // Prefetch Previous Page
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["institutions", { ...commonParams, page: page - 1, offset: (page - 2) * limit }],
        queryFn: () => listInstitutions({ ...commonParams, page: page - 1, offset: (page - 2) * limit })
      })
    }
  }, [page, limit, sortBy, sortDir, debouncedSearch, typeFilter, statusFilter, totalCount, queryClient])


  if (error) return (
    <Card className="p-12 flex flex-col items-center justify-center text-center border-destructive/20 bg-destructive/5">
      <AlertTriangle size={48} className="text-destructive mb-4" />
      <h3 className="text-xl font-bold text-destructive mb-2">Failed to load institutions</h3>
      <p className="text-muted-foreground">{error.response?.data?.message || error.message}</p>
    </Card>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
        <FetchingIndicator isFetching={isFetching} />
        <div className="absolute -right-12 -top-12 text-primary/5 rotate-12 pointer-events-none">
          <Building2 size={200} />
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3.5 bg-background shadow-sm rounded-xl text-primary border border-primary/10">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">Institutions Registry</h2>
            <p className="text-muted-foreground mt-1">Manage partner universities, exam boards, and regional offices.</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            setInstitutionToEdit(null)
            setIsModalOpen(true)
          }} 
          className="gap-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 relative z-10 h-11 px-6 rounded-xl font-semibold"
        >
          <Plus size={18} />
          New Institution
        </Button>
      </div>

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
        title="Delete Institution"
        description={`Are you sure you want to delete ${institutionToDelete?.name}? This action will also delete all linked colleges and departments. This cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
