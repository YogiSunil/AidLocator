useEffect(() => {
    if (!position) return;

    const filtered = resources.filter((r) => {
      const matchesMode = mode === 'need' ? r.isAvailable : r.isDonationPoint;
      const matchesType = filterType ? r.type.toLowerCase() === filterType.toLowerCase() : true;

      // Calculate distance in kilometers
      const R = 6371;
      const dLat = (r.latitude - position[0]) * Math.PI / 180;
      const dLon = (r.longitude - position[1]) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(position[0] * Math.PI / 180) * Math.cos(r.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return matchesMode && matchesType && (searchedPosition ? true : distance < 10);
    });
    setFilteredResources(filtered);
  }, [resources, mode, filterType, position, searchedPosition]);