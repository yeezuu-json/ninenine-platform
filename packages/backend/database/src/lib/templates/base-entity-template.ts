// Base entity template - copy these fields to every entity
// This ensures consistency without import dependencies

// Required fields for every entity:
/*
@PrimaryColumn({ type: 'uuid' })
id!: string;

@CreateDateColumn({ name: 'created_at' })
createdAt!: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt!: Date;

@DeleteDateColumn({ name: 'deleted_at' })
deletedAt?: Date;
*/

// Usage: Copy the above fields into every entity class
