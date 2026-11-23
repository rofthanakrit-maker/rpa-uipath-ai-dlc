# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-11-23

### Added
- Greenfield `rpa-uipath-ai-dlc-build` scope for building new UiPath bots from scratch (PDD -> SDD -> Code Generation -> Build and Test).
- MIT `LICENSE`, GitHub Actions test workflow, and expanded `.gitignore`.

### Changed
- Renamed plugin and repository to `rpa-uipath-ai-dlc` and prefixed scope, stage, and artifact IDs accordingly.
- Aligned stage contributions with the `uipath-rpa` skill.
- Hardened the Workflow Analyzer sensor and improved test temp directory cleanup.

## [0.1.0]

### Added
- Initial UiPath RPA AI-DLC plugin with `discovery` and `enhance` scopes, Process Assessment stage (fit score, ROI, Go / No-go), PDD/SDD shaping overlays, and the advisory `uipath-workflow-analyzer` sensor.
