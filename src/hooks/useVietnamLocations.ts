"use client";

import { useState, useEffect, useCallback } from "react";

interface Location {
  code: number;
  name: string;
}

interface ProvinceDetail {
  code: number;
  name: string;
  districts: Location[];
}

interface DistrictDetail {
  code: number;
  name: string;
  wards: Location[];
}

const API_BASE = "https://provinces.open-api.vn/api";

export function useVietnamLocations() {
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // Fetch all provinces on mount
  useEffect(() => {
    setLoading((prev) => ({ ...prev, provinces: true }));
    fetch(`${API_BASE}/?depth=1`)
      .then((res) => res.json())
      .then((data: Location[]) => {
        setProvinces(data);
      })
      .catch((err) => console.error("Failed to fetch provinces:", err))
      .finally(() => setLoading((prev) => ({ ...prev, provinces: false })));
  }, []);

  // Fetch districts when province changes
  const handleProvinceChange = useCallback((provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);

    if (!provinceCode) return;

    setLoading((prev) => ({ ...prev, districts: true }));
    fetch(`${API_BASE}/p/${provinceCode}?depth=2`)
      .then((res) => res.json())
      .then((data: ProvinceDetail) => {
        setDistricts(data.districts || []);
      })
      .catch((err) => console.error("Failed to fetch districts:", err))
      .finally(() => setLoading((prev) => ({ ...prev, districts: false })));
  }, []);

  // Fetch wards when district changes
  const handleDistrictChange = useCallback((districtCode: string) => {
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    setWards([]);

    if (!districtCode) return;

    setLoading((prev) => ({ ...prev, wards: true }));
    fetch(`${API_BASE}/d/${districtCode}?depth=2`)
      .then((res) => res.json())
      .then((data: DistrictDetail) => {
        setWards(data.wards || []);
      })
      .catch((err) => console.error("Failed to fetch wards:", err))
      .finally(() => setLoading((prev) => ({ ...prev, wards: false })));
  }, []);

  const handleWardChange = useCallback((wardCode: string) => {
    setSelectedWard(wardCode);
  }, []);

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    loading,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
  };
}
