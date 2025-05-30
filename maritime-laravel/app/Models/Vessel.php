<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vessel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'imo',
        'mmsi',
        'vessel_type',
        'flag',
        'built',
        'deadweight',
        'cargo_capacity',
        'current_lat',
        'current_lng',
        'speed',
        'course',
        'status',
        'departure_port',
        'destination_port',
        'departure_date',
        'eta',
        'callsign',
        'length',
        'width',
        'draught',
        'max_draught',
        'gross_tonnage',
        'net_tonnage',
        'home_port',
        'operator',
        'owner',
        'manager',
        'oil_source',
        'oil_grade',
        'metadata'
    ];

    protected $casts = [
        'built' => 'integer',
        'deadweight' => 'integer',
        'cargo_capacity' => 'integer',
        'current_lat' => 'decimal:8',
        'current_lng' => 'decimal:8',
        'speed' => 'decimal:2',
        'course' => 'decimal:2',
        'departure_date' => 'datetime',
        'eta' => 'datetime',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'draught' => 'decimal:2',
        'max_draught' => 'decimal:2',
        'gross_tonnage' => 'integer',
        'net_tonnage' => 'integer',
        'last_updated' => 'datetime'
    ];

    public function departurePortRelation()
    {
        return $this->belongsTo(Port::class, 'departure_port', 'name');
    }

    public function destinationPortRelation()
    {
        return $this->belongsTo(Port::class, 'destination_port', 'name');
    }

    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'Decommissioned');
    }

    public function scopeInTransit($query)
    {
        return $query->where('status', 'In Transit');
    }

    public function scopeByVesselType($query, $type)
    {
        return $query->where('vessel_type', $type);
    }

    public function getProgressAttribute()
    {
        if (!$this->departure_date || !$this->eta) {
            return 0;
        }

        $total = $this->eta->diffInHours($this->departure_date);
        $elapsed = now()->diffInHours($this->departure_date);
        
        if ($total <= 0) return 100;
        
        return min(100, max(0, ($elapsed / $total) * 100));
    }
}