import { Router } from 'express';
import { generateCargoManifest } from './cargo-manifest';

const router = Router();

// Generate cargo manifest for a vessel
router.get('/api/vessels/:id/cargo-manifest', generateCargoManifest);

export const cargoManifestRouter = router;