<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refinery extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country',
        'region',
        'lat',
        'lng',
        'capacity',
        'status',
        'description',
        'operator',
        'owner',
        'type',
        'products',
        'year_built',
        'last_maintenance',
        'next_maintenance',
        'complexity',
        'email',
        'phone',
        'website',
        'address',
        'technical_specs',
        'photo',
        'city',
        'utilization'
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
        'capacity' => 'integer',
        'year_built' => 'integer',
        'last_maintenance' => 'date',
        'next_maintenance' => 'date',
        'last_updated' => 'datetime',
        'utilization' => 'decimal:2'
    ];

    public function scopeByRegion($query, $region)
    {
        return $query->where('region', $region);
    }

    public function scopeOperational($query)
    {
        return $query->where('status', 'operational');
    }

    public function getUtilizationPercentageAttribute()
    {
        return $this->utilization ? ($this->utilization * 100) : 0;
    }
}