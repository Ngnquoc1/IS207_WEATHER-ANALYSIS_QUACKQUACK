<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Story extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $table = 'stories';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = '_id';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'description',
        'source',
        'url',
        'image_url',
        'author',
        'published_at',
        'category',
        'location',
        'is_active',
        'is_hot',
        'created_by'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_active' => 'boolean',
        'is_hot' => 'boolean',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['id'];

    /**
     * Perform the actual insert query into the database.
     * Override to ensure _id is set after insertion.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return bool
     */
    protected function performInsert($query)
    {
        if ($this->usesTimestamps()) {
            $this->updateTimestamps();
        }

        $attributes = $this->getAttributesForInsert();

        $id = $query->insertGetId($attributes, '_id');

        $this->setAttribute('_id', $id);
        
        $this->exists = true;
        $this->wasRecentlyCreated = true;

        return true;
    }

    /**
     * Get the value of the model's primary key.
     * Expose _id as id for frontend compatibility.
     *
     * @param mixed $value
     * @return mixed
     */
    public function getIdAttribute($value = null)
    {
        $attributes = $this->getAttributes();
        if (isset($attributes['_id'])) {
            return is_object($attributes['_id']) ? (string) $attributes['_id'] : $attributes['_id'];
        }
        return $value;
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
