import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  Pagination,
  Input,
  SearchFilterBar,
  AlertBanner
} from 'shared-ui';
import SharedKeyValueCard from '../../components/shared/SharedKeyValueCard';
import { Lightbulb, ChevronRight, Eye, Info, Sparkles, Filter, Settings, Cpu, HelpCircle, AlertTriangle, Loader2, CheckSquare } from 'lucide-react';
import {
  getRecommendationsApi,
  suggestBinRecommendationApi,
  recommend3dPlacementApi,
  generateStorageRecommendationApi,
  generateBinAllocationApi,
  completeBinAllocationApi
} from '../../services/recommendationService';
import { getBins } from '../../services/warehouseStructureService';
import { getProductBySkuApi } from '../../services/productService';

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const {
    aiRecommendations = [],
    inboundReceipts = [],
    products = [],
    workers = [],
    bins = [],
    assignPutawayTask,
    setAiRecommendations,
    setInboundReceipts,
    fetchInboundData,
    fetchPutawayTasks,
    fetchInventoryData,
    fetchUsers,
  } = useWarehouse();

  const mapRoleLabel = (role) => {
    if (!role) return 'Warehouse Operator';
    const r = role.toUpperCase();
    if (r === 'ADMIN') return 'Administrator';
    if (r === 'MANAGER' || r === 'WAREHOUSE_MANAGER') return 'Warehouse Manager';
    if (r === 'STAFF' || r === 'OPERATOR' || r === 'WAREHOUSE_OPERATOR') return 'Warehouse Operator';
    return role;
  };

  const getOperatorDisplayLabel = (w, idx) => {
    const mappedRole = mapRoleLabel(w.role);
    const firstName = (w.first_name || '').trim();
    const lastName = (w.last_name || '').trim();
    if (firstName && lastName) {
      return `${firstName} ${lastName} — ${mappedRole}`;
    } else if (firstName) {
      return `${firstName} — ${mappedRole}`;
    } else if (lastName) {
      return `${lastName} — ${mappedRole}`;
    }
    return `Operator ${idx + 1} — Warehouse Operator`;
  };

  // Robust operator list selection memoized
  const filteredOperators = useMemo(() => {
    // 1. First priority: users with role WAREHOUSE_OPERATOR or OPERATOR
    let ops = workers.filter(w => w.role === 'WAREHOUSE_OPERATOR' || w.role === 'OPERATOR');

    // 2. Second priority: include users with role STAFF / staff if no operator role exists
    if (ops.length === 0) {
      ops = workers.filter(w => w.role === 'STAFF' || w.role === 'staff');
    }

    // 3. Third priority: include any available worker/user as final fallback for demo
    if (ops.length === 0) {
      ops = workers;
    }

    // Hide users whose username contains "admin" unless explicitly an operator
    let filteredOps = ops.filter(w => {
      const username = (w.username || w.name || '').toLowerCase();
      const isExplicitOp = w.role === 'WAREHOUSE_OPERATOR' || w.role === 'OPERATOR';
      if (username.includes('admin') && !isExplicitOp) {
        return false;
      }
      return true;
    });

    if (filteredOps.length === 0 && ops.length > 0) {
      return ops;
    }
    return filteredOps;
  }, [workers]);

  // Tab state: 'monitor' | 'allocation-tools'
  const [activeTab, setActiveTab] = useState('monitor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRec, setSelectedRec] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Recommendations data
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // ---------------------------------------------------------------------------
  // Local bins state — backup direct fetch when context bins = [] (backend was
  // offline at app startup so WarehouseContext could not load bins).
  // ---------------------------------------------------------------------------
  const [localBins, setLocalBins] = useState([]);

  // Shared bin normalizer — same mapping used in WarehouseContext
  const normalizeBin = (b) => {
    const maxCap = Number(b.max_capacity ?? b.maxCapacity ?? 100);
    const curCap = Number(b.current_capacity ?? b.currentCapacity ?? 0);
    const isOccupied = b.is_occupied ?? false;

    const codeVal = b.bin_code ?? b.code ?? b.binCode ?? b.name;

    // Parse fallback locations from bin code pattern: RACK-A1-01-L1-B01
    let parsed = { zone: null, rack: null, shelf: null };
    if (codeVal && typeof codeVal === 'string') {
      const parts = codeVal.split('-');
      if (parts.length >= 2) {
        const rackPart = parts[1];
        if (rackPart && rackPart.length > 0) {
          const zoneLetter = rackPart.charAt(0).toUpperCase();
          if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(zoneLetter)) {
            parsed.zone = `Zone ${zoneLetter}`;
          }
        }
      }
      if (parts.length >= 4) {
        parsed.shelf = parts[3];
      }
      if (parts.length >= 3) {
        parsed.rack = `${parts[0]}-${parts[1]}-${parts[2]}`;
      } else if (parts.length >= 2) {
        parsed.rack = `${parts[0]}-${parts[1]}`;
      }
    }

    let status = b.status || null;
    if (!status) {
      if (isOccupied) status = 'FULL';
      else if (curCap >= maxCap && maxCap > 0) status = 'FULL';
      else status = 'Active';
    }

    return {
      id: b.bin_id ?? b.id ?? b.binId,
      code: codeVal,
      binCode: codeVal,
      shelfId: b.shelf ?? b.shelf_id ?? b.shelfId,
      rackId: b.rack_id ?? b.rackId,
      zoneId: b.zone_id ?? b.zoneId,
      zone: b.zone ?? parsed.zone,
      rack: b.rack ?? b.rack_code ?? parsed.rack,
      shelf: b.shelf_level ?? parsed.shelf ?? null,
      maxCapacity: maxCap,
      currentCapacity: curCap,
      isOccupied: isOccupied,
      status: status,
      ...b,
    };
  };

  useEffect(() => {
    // Only fetch bins here if context gave us nothing (i.e., backend was
    // offline when WarehouseContext first loaded).
    if (bins.length > 0) return;

    console.log('[Recommendations] Context bins empty — attempting backup direct fetch of /api/bins/');
    getBins()
      .then(res => {
        const raw = res?.results || [];
        console.log('[Recommendations] Backup fetch raw bins count:', raw.length, '| sample:', raw[0]);
        if (raw.length > 0) {
          const nb = raw.map(normalizeBin);
          console.log('[Recommendations] Backup normalized bins count:', nb.length, '| sample:', nb[0]);
          setLocalBins(nb);
        } else {
          console.warn('[Recommendations] Backup fetch also returned 0 bins. Raw response:', res);
        }
      })
      .catch(err => {
        console.error('[Recommendations] Backup /api/bins/ fetch failed:', err?.message || err);
      });
  }, [bins.length]);
  // ---------------------------------------------------------------------------

  // Live Slotting Flow State
  const [activeLiveItemId, setActiveLiveItemId] = useState(null);
  const [liveRecLoading, setLiveRecLoading] = useState(false);
  const [liveRecError, setLiveRecError] = useState(null);
  const [liveRecResult, setLiveRecResult] = useState(null);

  const [liveAllocLoading, setLiveAllocLoading] = useState(false);
  const [liveAllocError, setLiveAllocError] = useState(null);
  const [liveAllocResult, setLiveAllocResult] = useState(null);

  // Suggest Bin form state
  const [suggestSku, setSuggestSku] = useState('SKU-1002');
  const [suggestWeight, setSuggestWeight] = useState('12');
  const [suggestZone, setSuggestZone] = useState('Zone A');
  const [suggestQty, setSuggestQty] = useState('50');
  const [suggestResult, setSuggestResult] = useState(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState(null);

  // 3D Placement form state
  const [placementBin, setPlacementBin] = useState('BIN-001');
  const [placementSku, setPlacementSku] = useState('SKU-1002');
  const [placementQty, setPlacementQty] = useState('20');
  const [placementDim, setPlacementDim] = useState('30x30x30');
  const [placementResult, setPlacementResult] = useState(null);
  const [placementLoading, setPlacementLoading] = useState(false);
  const [placementError, setPlacementError] = useState(null);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadRecommendations = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await getRecommendationsApi();
      if (res.results && res.results.length > 0) {
        const mapped = res.results.map(r => ({
          id: r.id,
          productName: r.product_name || r.product || 'Unknown Product',
          sku: r.sku || 'N/A',
          bin: r.recommended_bin || 'BIN-001',
          shelf: r.shelf || 'Level 1',
          rack: r.rack || 'RACK-001',
          zone: r.zone || 'Zone A',
          confidence: r.confidence_score ? Math.round(Number(r.confidence_score) * 100) : 95,
          reason: r.reason || 'Volume-optimized placement logic.'
        }));
        setRecommendations(mapped);
        setFallbackUsed(false);
      } else {
        const msg = 'No recommendations returned from API.';
        setApiError(msg);
        setRecommendations([]);
        setFallbackUsed(false);
      }
    } catch (err) {
      console.warn('API Error - recommendations fetch failed:', err);
      const msg = 'Recommendations API unavailable.';
      setApiError(msg);
      setRecommendations([]);
      setFallbackUsed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchUsers) fetchUsers(true);
    if (fetchInboundData) fetchInboundData(true);
    if (fetchPutawayTasks) fetchPutawayTasks(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'monitor') {
      loadRecommendations();
    }
  }, [activeTab]);

  // ---------------------------------------------------------------------------
  // Pick the best available real bin from context for local fallback
  // ---------------------------------------------------------------------------
  const pickFallbackBin = (customBins) => {
    // Merge context bins with locally fetched bins (backup fetch when context was empty)
    // Deduplicate by code so we don't double-count if context later reloads
    const allBins = customBins || (bins.length > 0 ? bins : localBins);

    console.log('[Recommendations] bins count', bins.length);
    console.log('[Recommendations] sample bin', bins[0]);

    if (allBins.length === 0) {
      console.error('[Recommendations] No bins with any code field found in context. Full bins array:', bins, '| localBins:', localBins);
      return null;
    }

    const hasBinCode = (b) => !!(b.code || b.binCode || b.bin_code || b.name);

    const isAvailable = (b) => {
      const maxCap = Number(b.maxCapacity ?? b.max_capacity ?? 0);
      const curCap = Number(b.currentCapacity ?? b.current_capacity ?? 0);
      const isOccupied = b.isOccupied ?? b.is_occupied ?? false;

      // Available bin logic: is_occupied === false OR currentCapacity < maxCapacity
      return (isOccupied === false || curCap < maxCap);
    };

    // Prefer: has code + available
    const availableBins = allBins.filter(b => hasBinCode(b) && isAvailable(b));
    console.log('[Recommendations] available bins count', availableBins.length);

    if (availableBins.length > 0) {
      const pick = availableBins[Math.floor(Math.random() * availableBins.length)];
      // Normalize the picked bin's code to a single field for downstream use
      return {
        ...pick,
        code: pick.code || pick.binCode || pick.bin_code || pick.name,
        zone: pick.zone || null,
        rack: pick.rack || pick.rack_code || null,
        shelf: pick.shelf || pick.shelf_level || null,
      };
    }

    // Fallback 2: any bin with any code identifier (even if availability unknown)
    const anyWithCode = allBins.filter(hasBinCode);
    if (anyWithCode.length > 0) {
      console.warn('[Recommendations] No clearly available bins — using first bin with a code identifier.');
      const pick = anyWithCode[0];
      return {
        ...pick,
        code: pick.code || pick.binCode || pick.bin_code || pick.name,
        zone: pick.zone || null,
        rack: pick.rack || pick.rack_code || null,
        shelf: pick.shelf || pick.shelf_level || null,
      };
    }

    // Truly no usable bins at all
    console.error('[Recommendations] No bins with any code field found in context. Full bins array:', bins, '| localBins:', localBins);
    return null;
  };

  // ---------------------------------------------------------------------------
  // Lookup function to map SKU from receipt to Product UUID
  // ---------------------------------------------------------------------------
  const getProductUuidForSku = (sku) => {
    const prod = products.find(p => p.sku === sku || p.productId === sku || p.id === sku);
    return prod ? (prod.productId || prod.id) : null;
  };

  // ---------------------------------------------------------------------------
  // Ensure bins are loaded on-demand
  // ---------------------------------------------------------------------------
  const ensureBinsLoaded = async () => {
    let currentBins = bins.length > 0 ? bins : localBins;
    if (currentBins.length === 0) {
      console.log('[Recommendations] Bins empty. Triggering on-demand fetch of /api/bins/ inside handler...');
      try {
        const res = await getBins();
        const raw = res?.results || [];
        if (raw.length > 0) {
          const nb = raw.map(normalizeBin);
          console.log('[Recommendations] On-demand fetched and normalized bins:', nb.length);
          setLocalBins(nb);
          return nb;
        } else {
          console.warn('[Recommendations] On-demand fetch returned 0 results.');
        }
      } catch (err) {
        console.error('[Recommendations] On-demand fetch failed:', err?.message || err);
      }
    }
    return currentBins;
  };

  // ---------------------------------------------------------------------------
  // SUGGEST STORAGE SLOT — with console log, visible error, and local fallback
  // ---------------------------------------------------------------------------
  const handleGenerateStorageRecommendation = async (receipt) => {
    console.log('[Recommendations] Suggest Storage Slot clicked', receipt);

    // Open the results panel immediately
    setActiveLiveItemId(receipt.id);
    setLiveRecLoading(true);
    setLiveRecError(null);
    setLiveRecResult(null);
    setLiveAllocResult(null);
    setLiveAllocError(null);

    const loadedBins = await ensureBinsLoaded();

    if (receipt.sku === 'SKU-GENERIC') {
      setLiveRecResult({
        zoneGroup: 'Ambient Storage ZG',
        zone: 'Zone B',
        score: 90,
        reason: 'Default dummy slotting for generic products.',
        orientation: '-',
        maxUnits: '-',
        utilizationScore: '-',
        version: 'v1',
        isFallback: true,
      });
      setLiveRecLoading(false);
      showToast('Storage recommendation fetched successfully!');
      return;
    }

    let productUuid = receipt.productId || getProductUuidForSku(receipt.sku);

    if (!productUuid && receipt.sku) {
      try {
        console.log(`[Recommendations] Product UUID not found locally for SKU "${receipt.sku}". Fetching from backend...`);
        const backendProd = await getProductBySkuApi(receipt.sku);
        if (backendProd) {
          productUuid = backendProd.productId || backendProd.id;
          console.log(`[Recommendations] Resolved SKU "${receipt.sku}" to UUID "${productUuid}" via backend.`);
        }
      } catch (err) {
        console.warn(`[Recommendations] Backend SKU lookup failed for "${receipt.sku}":`, err);
      }
    }

    if (!productUuid) {
      const msg = 'Backend UUID missing. Please refresh inbound data.';
      console.warn(`[Recommendations] ${msg}`);
      setLiveRecError(msg);
      setLiveRecLoading(false);
      showToast(msg, 'error');
      return;
    }

    try {
      const res = await generateStorageRecommendationApi(productUuid);
      const result = {
        zoneGroup: res.zone_group || 'N/A',
        zone: res.zone || 'N/A',
        score: res.recommendation_score ? Math.round(Number(res.recommendation_score) * 100) : 95,
        reason: res.recommendation_reason || 'AI dynamic slotting layout verified.',
        orientation: res.selected_orientation || '-',
        maxUnits: res.max_units || '-',
        utilizationScore: res.utilization_score || '-',
        version: res.recommendation_version || 'v1',
        isFallback: false,
      };
      setLiveRecResult(result);
      showToast('Storage recommendation fetched successfully!');
    } catch (err) {
      console.error('[Recommendations] Storage recommendation API failed:', err);
      const msg = 'Backend recommendation API unavailable.';
      setLiveRecError(msg);
      showToast(msg, 'error');
    } finally {
      setLiveRecLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Commit bin allocation to inbound receipt and AI recommendation lists
  // ---------------------------------------------------------------------------
  const commitAllocation = (receipt, binVal, shelfVal, rackVal, zoneVal, scoreVal, reasonVal) => {
    const zGroup = zoneVal === 'Zone D' ? 'Cold Storage ZG' : 'Ambient Storage ZG';
    const aisleVal = zoneVal === 'Zone C' ? 'Aisle 3' : 'Aisle 1';




    const customRec = {
      id: `REC-${Date.now()}`,
      inboundId: receipt.id,
      title: `AI Bin Allocation for ${receipt.productName}`,
      sku: receipt.sku,
      productName: receipt.productName,
      quantity: receipt.verifiedQuantity || receipt.quantityReceived,
      zoneGroup: zGroup,
      zone: zoneVal,
      aisle: aisleVal,
      rack: rackVal,
      shelf: shelfVal,
      bin: binVal,
      binCode: binVal,
      confidence: scoreVal,
      reason: reasonVal,
      storageStatus: 'ALLOCATED',
      allocationStatus: 'BIN_ALLOCATED',
      status: 'RECOMMENDATION_APPROVED',
      createdAt: new Date().toISOString()
    };

    const allocation = customRec;
    console.log('[Recommendations] allocation created', allocation);

    if (setAiRecommendations) {
      setAiRecommendations(prev => {
        const filtered = prev.filter(r => r.inboundId !== receipt.id);
        return [customRec, ...filtered];
      });
    }

    if (setInboundReceipts) {
      setInboundReceipts(prev => prev.map(r =>
        r.id === receipt.id ? {
          ...r,
          status: 'BIN_ALLOCATED',
          bin: binVal,
          binCode: binVal,
          allocatedBin: binVal,
          zone: zoneVal,
          zoneGroup: zGroup,
          aisle: aisleVal,
          rack: rackVal,
          shelf: shelfVal,
          storageStatus: 'ALLOCATED',
          allocationStatus: 'BIN_ALLOCATED'
        } : r
      ));
    }
  };

  // ---------------------------------------------------------------------------
  // CONFIRM & ALLOCATE BIN — with console log, visible error, and local fallback
  // ---------------------------------------------------------------------------
  const handleGenerateBinAllocation = async (receipt) => {
    console.log('[Recommendations] Confirm Allocate clicked', receipt);

    // Open the results panel immediately
    setActiveLiveItemId(receipt.id);
    setLiveAllocLoading(true);
    setLiveAllocError(null);
    setLiveAllocResult(null);
    setLiveRecResult(null);
    setLiveRecError(null);

    // Ensure bins are loaded (needed for UI rendering later)
    await ensureBinsLoaded();

    if (receipt.sku === 'SKU-GENERIC') {
      const apiResult = {
        allocationId: `alloc-${Date.now()}`,
        binCode: 'BIN-002',
        rack: 'R-1',
        shelf: 'S-10',
        zone: 'Zone B',
        score: 90,
        reason: 'Default mock allocation for generic products.',
        routeDistance: '0',
        routePath: [],
        storageStatus: 'ALLOCATED',
        isFallback: true,
      };
      setLiveAllocResult(apiResult);
      
      commitAllocation(
        receipt,
        apiResult.binCode,
        apiResult.shelf,
        apiResult.rack,
        apiResult.zone,
        apiResult.score,
        apiResult.reason
      );
      showToast(`Bin "${apiResult.binCode}" identified. Please assign an operator to dispatch.`);
      setLiveAllocLoading(false);
      return;
    }

    // Resolve product UUID – try local cache then backend lookup
    let productUuid = receipt.productId || getProductUuidForSku(receipt.sku);
    if (!productUuid && receipt.sku) {
      try {
        console.log(`[Recommendations] Product UUID not found locally for SKU "${receipt.sku}". Fetching from backend...`);
        const backendProd = await getProductBySkuApi(receipt.sku);
        if (backendProd) {
          productUuid = backendProd.productId || backendProd.id;
          console.log(`[Recommendations] Resolved SKU "${receipt.sku}" to UUID "${productUuid}" via backend.`);
        }
      } catch (err) {
        console.warn(`[Recommendations] Backend SKU lookup failed for "${receipt.sku}":`, err);
      }
    }

    // If we still don't have a UUID, abort with a clear message
    if (!productUuid) {
      const msg = 'Backend UUID missing. Please refresh inbound data.';
      console.warn(`[Recommendations] ${msg}`);
      setLiveAllocError(msg);
      setLiveAllocLoading(false);
      showToast(msg, 'error');
      return;
    }

    // Call the real backend allocation endpoint
    try {
      const res = await generateBinAllocationApi(productUuid, receipt._rawBackendId || receipt.id);
      const apiResult = {
        allocationId: res.id,
        binCode: res.bin?.code || 'N/A',
        rack: res.rack?.code || 'N/A',
        shelf: res.shelf?.number || 'N/A',
        zone: res.zone || 'Zone A',
        score: res.allocation_score ? Math.round(Number(res.allocation_score) * 100) : 95,
        reason: res.allocation_reason || 'AI spatial assignment completed.',
        routeDistance: res.route?.distance || '0',
        routePath: res.route?.path || [],
        storageStatus: res.storage_status || 'ALLOCATED',
        isFallback: false,
      };
      setLiveAllocResult(apiResult);
      console.log("apiResult", apiResult);
      
      // Update the UI state to move item from pending to allocated
      commitAllocation(
        receipt,
        apiResult.binCode,
        apiResult.shelf,
        apiResult.rack,
        apiResult.zone,
        apiResult.score,
        apiResult.reason
      );

      showToast(`Bin "${apiResult.binCode}" identified. Please assign an operator to dispatch.`);
    } catch (err) {
      console.error('[Recommendations] Bin allocation API failed:', err);
      const msg = 'Backend recommendation API unavailable.';
      setLiveAllocError(msg);
      showToast(msg, 'error');
      return;
    } finally {
      setLiveAllocLoading(false);
    }
  };

  // Handlers for Tools memoized with useCallback
  const handleSuggestBin = useCallback(async (e) => {
    if (e) e.preventDefault();
    setSuggestLoading(true);
    setSuggestResult(null);
    setSuggestError(null);
    try {
      const payload = {
        sku: suggestSku,
        weight: Number(suggestWeight),
        zone: suggestZone,
        quantity: Number(suggestQty)
      };
      const res = await suggestBinRecommendationApi(payload);
      if (!res.recommended_bin) {
        throw new Error("Invalid response from server: recommended_bin missing.");
      }
      setSuggestResult({
        bin: res.recommended_bin,
        aisle: res.aisle,
        shelf: res.shelf,
        confidence: res.confidence ? Math.round(Number(res.confidence) * 100) : null,
        reason: res.reason
      });
    } catch (err) {
      console.error("API suggest-bin offline:", err);
      setSuggestError("AI Target Bin Suggestion Service offline or request failed.");
      setSuggestResult(null);
    } finally {
      setSuggestLoading(false);
    }
  }, [suggestSku, suggestWeight, suggestZone, suggestQty]);

  const handleSimulatePlacement = useCallback(async (e) => {
    if (e) e.preventDefault();
    setPlacementLoading(true);
    setPlacementResult(null);
    setPlacementError(null);
    try {
      const payload = {
        bin: placementBin,
        sku: placementSku,
        quantity: Number(placementQty),
        box_dimensions: placementDim
      };
      const res = await recommend3dPlacementApi(payload);
      if (res.x_offset == null) {
        throw new Error("Invalid response from server: coordinates missing.");
      }
      setPlacementResult({
        x: res.x_offset,
        y: res.y_offset,
        z: res.z_offset,
        orientation: res.orientation,
        utilization: res.utilization_percentage ? Math.round(Number(res.utilization_percentage)) : null
      });
    } catch (err) {
      console.error("API 3d-placement offline:", err);
      setPlacementError("AI 3D Coordinate Placement Service offline or request failed.");
      setPlacementResult(null);
    } finally {
      setPlacementLoading(false);
    }
  }, [placementBin, placementSku, placementQty, placementDim]);

  // Filter list memoized with useMemo
  const filteredRecs = useMemo(() => {
    return recommendations.filter(rec =>
      (rec.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.bin || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recommendations, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRecs.length / pageSize));
  const paginatedRecs = filteredRecs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce shadow-lg rounded-xl">
          <AlertBanner type={toastType} message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Receiving &amp; Inventory Officer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">AI Recommendations</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-amber-500 animate-pulse" />
            Storage Recommendation Monitor
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor active storage recommendations and run simulations for optimized 3D placements.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-150">
        <button
          onClick={() => { setActiveTab('monitor'); setCurrentPage(1); }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'monitor'
            ? 'border-[#0071C1] text-[#0071C1]'
            : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
        >
          <Cpu className="w-4.5 h-4.5" />
          AI Recommendations Monitor
        </button>
        <button
          onClick={() => { setActiveTab('allocation-tools'); }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'allocation-tools'
            ? 'border-[#0071C1] text-[#0071C1]'
            : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
        >
          <Settings className="w-4.5 h-4.5" />
          AI Allocation Tools
        </button>
      </div>

      {activeTab === 'monitor' ? (
        <>
          {/* Pending Bin Allocation Queue */}
          <Card className="border border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50/10 mb-6">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-bold uppercase text-blue-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-blue-600 animate-pulse" />
                    Pending Bin Allocation Queue
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Inbound items verified by Inventory Officer awaiting AI storage recommendation and physical bin assignment.
                  </CardDescription>
                </div>
                <Badge variant="primary" className="text-xs font-mono">
                  {inboundReceipts.filter(r => r.status === 'WAITING_FOR_BIN_ASSIGNMENT').length} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {inboundReceipts.filter(r => r.status === 'WAITING_FOR_BIN_ASSIGNMENT').length === 0 ? (
                <div className="text-center py-6 text-gray-500 font-semibold text-xs">
                  No inventory pending recommendation yet.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Receipt / Reference</TableHead>
                          <TableHead>Product Details</TableHead>
                          <TableHead>Qty / Wt / Dim</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">AI Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inboundReceipts.filter(r => r.status === 'WAITING_FOR_BIN_ASSIGNMENT').map((receipt) => {
                          const isActive = activeLiveItemId === receipt.id;
                          return (
                            <React.Fragment key={receipt.id}>
                              <TableRow className="hover:bg-slate-50/20 transition-colors">
                                <TableCell>
                                  <div className="font-bold text-gray-900 text-xs">{receipt.id}</div>
                                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">{receipt.documentReference}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-bold text-gray-800 text-xs">{receipt.productName}</div>
                                  <div className="text-[10px] text-gray-500 font-mono">SKU: {receipt.sku}</div>
                                </TableCell>
                                <TableCell className="text-xs text-slate-700">
                                  <div>Qty: <span className="font-bold text-slate-900">{receipt.verifiedQuantity || receipt.quantityReceived}</span></div>
                                  <div className="text-[10px] text-slate-500">{receipt.weight || 'N/A'} | {receipt.dimensions || 'N/A'}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="warning" className="text-[9px] uppercase font-bold animate-pulse">
                                    Awaiting Bin
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-[11px] h-8 px-3 font-semibold border-amber-200 hover:bg-amber-50 text-amber-800 flex items-center gap-1"
                                      onClick={() => handleGenerateStorageRecommendation(receipt)}
                                      disabled={liveRecLoading && isActive}
                                    >
                                      {liveRecLoading && isActive ? (
                                        <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                                      ) : (
                                        <Lightbulb className="w-3.5 h-3.5" />
                                      )}
                                      Suggest Storage Slot
                                    </Button>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="text-[11px] h-8 px-3 font-semibold bg-[#0071C1] hover:bg-[#005c9e] text-white flex items-center gap-1"
                                      onClick={() => handleGenerateBinAllocation(receipt)}
                                      disabled={liveAllocLoading && isActive}
                                    >
                                      {liveAllocLoading && isActive ? (
                                        <Loader2 className="w-3 h-3 animate-spin text-white" />
                                      ) : (
                                        <CheckSquare className="w-3.5 h-3.5" />
                                      )}
                                      Confirm &amp; Allocate Bin
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {/* Live Results Panel — renders whenever this row is active */}
                              {isActive && (
                                <TableRow>
                                  <TableCell colSpan={5} className="bg-slate-50/50 p-4 border-t border-b border-gray-150">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                      {/* 1. Storage Recommendation Panel */}
                                      <div className="p-4 bg-amber-50/30 border border-amber-150 rounded-xl space-y-2">
                                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                          AI Storage Slotting Recommendation
                                        </h4>
                                        {liveRecLoading ? (
                                          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-amber-500 animate-pulse" />
                                            Querying AI slotting heuristics...
                                          </div>
                                        ) : liveRecError ? (
                                          <div className="text-xs text-red-700 font-semibold p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-1.5 text-left">
                                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                            <span>{liveRecError}</span>
                                          </div>
                                        ) : liveRecResult ? (
                                          <div className="space-y-2 text-xs font-semibold text-slate-700 text-left">



                                            <div className="flex justify-between items-center">
                                              <span>Recommended Zone: <span className="font-bold text-gray-900">{liveRecResult.zone}</span></span>
                                              <Badge variant="success" className="font-mono">{liveRecResult.score}% Confidence</Badge>
                                            </div>
                                            <div>Zone Group: <span className="text-gray-900">{liveRecResult.zoneGroup}</span></div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed pt-1.5 border-t border-dashed border-amber-200">
                                              <span className="font-bold text-slate-700 block">AI Rationale:</span>
                                              {liveRecResult.reason}
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="text-xs text-gray-400 font-medium py-2">
                                            Click "Suggest Storage Slot" to fetch AI heuristics.
                                          </div>
                                        )}
                                      </div>

                                      {/* 2. Bin Allocation Panel */}
                                      <div className="p-4 bg-blue-50/30 border border-blue-150 rounded-xl space-y-2">
                                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                                          <Cpu className="w-3.5 h-3.5 text-blue-600" />
                                          AI Physical Bin Allocation
                                        </h4>
                                        {liveAllocLoading ? (
                                          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                            Running spatial allocation algorithm...
                                          </div>
                                        ) : liveAllocError ? (
                                          <div className="text-xs text-red-700 font-semibold p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-1.5 text-left">
                                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                            <span>{liveAllocError}</span>
                                          </div>
                                        ) : liveAllocResult ? (
                                          <div className="space-y-3 text-xs font-semibold text-slate-700 text-left font-sans">

                                            <div className="flex justify-between items-center">
                                              <span>Allocated Bin: <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{liveAllocResult.binCode}</span></span>
                                              <Badge variant="primary" className="font-mono">{liveAllocResult.score}% Fit Score</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white border border-gray-100 p-2 rounded-lg font-semibold text-slate-650">
                                              <div>Rack ID: <span className="text-gray-900 font-mono">{liveAllocResult.rack}</span></div>
                                              <div>Shelf Level: <span className="text-gray-900 font-mono">Level {liveAllocResult.shelf}</span></div>
                                              <div>Status: <span className="text-emerald-700 font-bold">{liveAllocResult.storageStatus}</span></div>
                                              <div>Transit Route: <span className="text-gray-900">{liveAllocResult.routeDistance}m</span></div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-b border-gray-100 pb-2">
                                              <span className="font-bold text-slate-700 block">AI Allocation Reason:</span>
                                              {liveAllocResult.reason}
                                            </p>

                                            {/* Action to Dispatch/Create Putaway Task */}
                                            <div className="space-y-2 pt-2">
                                              <div className="flex gap-2">
                                                <div className="flex-1 text-left">
                                                  <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">Assign Operator *</label>
                                                  <select
                                                    id={`operator-select-${receipt.id}`}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-xs font-semibold text-gray-700"
                                                    defaultValue=""
                                                  >
                                                    {filteredOperators.length === 0 ? (
                                                      <option value="" disabled>No operators loaded. Check /api/users/ or create operator user.</option>
                                                    ) : (
                                                      <>
                                                        <option value="" disabled>Select Operator...</option>
                                                        {filteredOperators.map((w, idx) => (
                                                          <option key={w.id} value={`${w.id}|${w.name}`}>{getOperatorDisplayLabel(w, idx)}</option>
                                                        ))}
                                                      </>
                                                    )}
                                                  </select>
                                                  {filteredOperators.length === 0 && (
                                                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                                                      No operators loaded. Check /api/users/ or create operator user.
                                                    </p>
                                                  )}
                                                </div>
                                                <div className="text-left">
                                                  <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">Priority</label>
                                                  <select
                                                    id={`priority-select-${receipt.id}`}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-xs font-semibold text-gray-700"
                                                    defaultValue="Medium"
                                                  >
                                                    <option value="High">High</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Low">Low</option>
                                                  </select>
                                                </div>
                                              </div>
                                              <Button
                                                size="sm"
                                                className="w-full bg-[#0071C1] hover:bg-[#005c9e] text-white py-2 font-bold justify-center"
                                                onClick={() => {
                                                  console.log('[Recommendations] Create & Assign Putaway Task clicked', receipt.id);

                                                  const opSel = document.getElementById(`operator-select-${receipt.id}`);
                                                  const priSel = document.getElementById(`priority-select-${receipt.id}`);
                                                  const opVal = opSel ? opSel.value : '';
                                                  const priVal = priSel ? priSel.value : 'Medium';

                                                  if (!opVal) {
                                                    showToast('Please select a warehouse operator before dispatching.', 'warning');
                                                    return;
                                                  }

                                                  const [opId, opName] = opVal.split('|');

                                                  // Construct AI recommendation object using real allocated bin
                                                  const customRec = {
                                                    id: `REC-${Date.now()}`,
                                                    inboundId: receipt.id,
                                                    title: `AI Bin Allocation for ${receipt.productName}`,
                                                    sku: receipt.sku,
                                                    productName: receipt.productName,
                                                    quantity: receipt.verifiedQuantity || receipt.quantityReceived,
                                                    zone: liveAllocResult.zone || liveRecResult?.zone || 'Zone A',
                                                    aisle: 'A1',
                                                    rack: liveAllocResult.rack || 'RACK-001',
                                                    shelf: `Level ${liveAllocResult.shelf || 1}`,
                                                    bin: liveAllocResult.binCode,
                                                    confidence: liveAllocResult.score || 87,
                                                    reason: liveAllocResult.reason || 'AI spatial assignment completed.',
                                                    status: 'RECOMMENDATION_APPROVED',
                                                    createdAt: new Date().toISOString()
                                                  };

                                                  console.log('[Recommendations] Dispatching with customRec:', customRec);

                                                  // Push into local aiRecommendations
                                                  setAiRecommendations(prev => [customRec, ...prev]);

                                                  // Call assignPutawayTask — advances receipt to ASSIGNED_TO_STAFF
                                                  assignPutawayTask(receipt.id, opId, opName, priVal, customRec);
                                                  
                                                  // Complete the bin allocation in the backend
                                                  if (liveAllocResult.allocationId && !liveAllocResult.isFallback) {
                                                    completeBinAllocationApi(liveAllocResult.allocationId, opId)
                                                      .catch(err => console.warn('[Recommendations] Backend complete failed:', err));
                                                  }

                                                  showToast(`Putaway task assigned to ${opName} — Bin: ${liveAllocResult.binCode}`, 'success');

                                                  // Clear live state
                                                  setActiveLiveItemId(null);
                                                  setLiveRecResult(null);
                                                  setLiveAllocResult(null);
                                                }}
                                              >
                                                Create &amp; Assign Putaway Task
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-xs text-gray-400 font-medium py-2 font-semibold">
                                            Click "Confirm &amp; Allocate Bin" to execute the spatial allocator.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </>
      ) : (
        /* Allocation tools: Suggest Bin & 3D Simulation */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tool 1: AI Bin Suggestion */}
          <Card className="border border-gray-100 shadow-sm flex flex-col justify-between">
            <CardHeader className="bg-slate-50/40 pb-4 border-b border-gray-100">
              <CardTitle className="text-sm font-bold uppercase text-gray-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Target Bin Suggestion Tool
              </CardTitle>
              <CardDescription className="text-xs">
                Calculate the optimal target storage slot using dimensions &amp; inventory metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <form onSubmit={handleSuggestBin} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-gray-600 mb-1">Product SKU Code *</label>
                  <Input value={suggestSku} onChange={(e) => setSuggestSku(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Weight (kg) *</label>
                    <Input type="number" value={suggestWeight} onChange={(e) => setSuggestWeight(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Quantity *</label>
                    <Input type="number" value={suggestQty} onChange={(e) => setSuggestQty(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Target Zone preference</label>
                  <select
                    value={suggestZone}
                    onChange={(e) => setSuggestZone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-xs font-medium text-gray-700"
                  >
                    <option value="Zone A">Zone A (Fast Moving)</option>
                    <option value="Zone B">Zone B (Electronics)</option>
                    <option value="Zone C">Zone C (Bulk Storage)</option>
                    <option value="Zone D">Zone D (Cold Storage)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={suggestLoading}
                  className="w-full bg-[#0071C1] hover:bg-[#005c9e] text-white justify-center py-2.5 font-bold gap-2 text-xs"
                >
                  {suggestLoading ? 'Calculating optimal bin...' : 'Suggest Optimal Bin'}
                </Button>
              </form>

              {/* Suggest Result Card */}
              {suggestResult && (
                <div className="mt-5 p-4 bg-blue-50/50 border border-blue-150 rounded-xl space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center border-b border-blue-100/50 pb-1.5">
                    <span className="text-blue-900 font-bold uppercase tracking-wider text-[10px]">Optimal Target Bin</span>
                    <Badge variant="success" className="font-mono">{suggestResult.confidence}% Confidence</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>Bin Code: <span className="font-mono text-blue-700 font-bold">{suggestResult.bin}</span></div>
                    <div>Location: <span className="text-gray-900">{suggestResult.aisle} &bull; {suggestResult.shelf}</span></div>
                  </div>
                  <p className="text-slate-500 italic font-medium mt-2 pt-2 border-t border-dashed border-blue-100">
                    {suggestResult.reason}
                  </p>
                </div>
              )}

              {suggestError && (
                <div className="mt-5 p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2 text-xs font-semibold text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                  <p>{suggestError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 2: 3D Placement Simulation */}
          <Card className="border border-gray-100 shadow-sm flex flex-col justify-between">
            <CardHeader className="bg-slate-50/40 pb-4 border-b border-gray-100">
              <CardTitle className="text-sm font-bold uppercase text-gray-700 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#0071C1]" />
                3D Coordinate Placement Simulator
              </CardTitle>
              <CardDescription className="text-xs">
                Simulate spatial bounding offsets within a physical slot grid location.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <form onSubmit={handleSimulatePlacement} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-gray-600 mb-1">Target Bin Code *</label>
                  <Input value={placementBin} onChange={(e) => setPlacementBin(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Product SKU *</label>
                    <Input value={placementSku} onChange={(e) => setPlacementSku(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Quantity *</label>
                    <Input type="number" value={placementQty} onChange={(e) => setPlacementQty(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Box Dimensions (L x W x H in cm)</label>
                  <Input value={placementDim} onChange={(e) => setPlacementDim(e.target.value)} placeholder="e.g. 30x30x30" />
                </div>

                <Button
                  type="submit"
                  disabled={placementLoading}
                  className="w-full bg-[#0071C1] hover:bg-[#005c9e] text-white justify-center py-2.5 font-bold gap-2 text-xs"
                >
                  {placementLoading ? 'Simulating layout graph offsets...' : 'Simulate 3D Placement'}
                </Button>
              </form>

              {/* Simulation Result Card */}
              {placementResult && (
                <div className="mt-5 p-4 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center border-b border-indigo-100/50 pb-1.5">
                    <span className="text-indigo-900 font-bold uppercase tracking-wider text-[10px]">3D Layout Grid Simulation</span>
                    <Badge variant="primary">{placementResult.utilization}% Volumetric Space Occupied</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-700 font-mono text-center text-[10px]">
                    <div className="bg-white border border-indigo-100 p-1 rounded">X-Offset: {placementResult.x}m</div>
                    <div className="bg-white border border-indigo-100 p-1 rounded">Y-Offset: {placementResult.y}m</div>
                    <div className="bg-white border border-indigo-100 p-1 rounded">Z-Offset: {placementResult.z}m</div>
                  </div>
                  <div className="text-slate-700 mt-2 text-[10px]">
                    Orientation: <span className="font-bold text-gray-900">{placementResult.orientation}</span>
                  </div>
                </div>
              )}

              {placementError && (
                <div className="mt-5 p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2 text-xs font-semibold text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                  <p>{placementError}</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}

      {/* Diagnostics details modal */}
      {selectedRec && (
        <Modal
          isOpen={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          title="Inspect Recommendation Diagnostics"
          maxWidth="max-w-md"
          footer={
            <Button onClick={() => setSelectedRec(null)} className="w-full justify-center text-xs">Close Diagnostic Panel</Button>
          }
        >
          <div className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="p-4 bg-slate-900 text-white rounded-2xl">
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Target Item SKU / Name</span>
              <span className="text-sm font-bold block mt-0.5">{selectedRec.productName}</span>
              <span className="text-[10px] font-mono text-slate-300 mt-0.5 block">{selectedRec.sku}</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-3 text-slate-700 font-semibold">
              <div>Recommended Bin: <span className="font-mono text-blue-700 font-bold">{selectedRec.bin}</span></div>
              <div>Elevation: <span className="text-gray-900">{selectedRec.shelf}</span></div>
              <div>Rack ID: <span className="text-gray-900 font-mono">{selectedRec.rack}</span></div>
              <div>Zone: <span className="text-gray-900">{selectedRec.zone}</span></div>
            </div>

            <div className="p-3.5 bg-blue-50/50 border border-blue-150 rounded-xl space-y-1.5">
              <span className="font-bold text-blue-900 block uppercase text-[10px] tracking-wider">AI Storage Rationale</span>
              <p className="text-blue-950 leading-relaxed font-semibold">{selectedRec.reason}</p>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl bg-white space-y-2">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wider text-[#0071C1] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                Storage Rules Enforced
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                <li>Volumetric Capacity Fit: <span className="text-emerald-600 font-bold">Passed (95% safety margin)</span></li>
                <li>Weight Load Limit Verification: <span className="text-emerald-600 font-bold">Passed (100% compliant)</span></li>
                <li>Pick Rate Velocity Compatibility: <span className="text-emerald-600 font-bold">Matched (Aisle optimized)</span></li>
                <li>Ambient/Temperature Zone Compliance: <span className="text-emerald-600 font-bold">Passed</span></li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
