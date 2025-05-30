<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Port extends Model
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
        'type'
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
        'capacity' => 'integer',
        'last_updated' => 'datetime'
    ];

    public function vesselsDeparting()
    {
        return $this->hasMany(Vessel::class, 'departure_port', 'name');
    }

    public function vesselsArriving()
    {
        return $this->hasMany(Vessel::class, 'destination_port', 'name');
    }

    public function scopeByRegion($query, $region)
    {
        return $query->where('region', $region);
    }

    public function scopeOperational($query)
    {
        return $query->where('status', 'operational');
    }

    public function getActiveVesselsCountAttribute()
    {
        return $this->vesselsDeparting()->count() + $this->vesselsArriving()->count();
    }
}