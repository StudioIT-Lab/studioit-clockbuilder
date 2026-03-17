# Changelog

All notable changes to this project will be documented in this file.

## [2.1.4] - 2026-03-17

### Fixed
- **`publish-npm.yml` workflow**: Fixed errors in workflow for automatic npm publishing.

## [2.1.3] - 2026-03-17

### Added
- **`publish-npm.yml` workflow**: Added workflow for automatic npm publishing.

## [2.1.1] - 2026-03-17

### Fixed
- **Shadowed Methods**: Removed redundant code definitions to improve quality scores.

## [2.1.0] - 2026-03-17

### Added
- **`remove()` method**: Cleanly removes clock instances, stops loops, and disconnects observers to prevent memory leaks in SPAs.
- **Impulse Jiggle**: Added mechanical-style jiggle (damped harmonic motion) to hands during the impulse sync phase.
- **Instance Randomization**: Each clock instance now generates a unique `impulseCycle` duration for realistic mechanical variance.

### Fixed
- **Global Loop Bug**: Fixed `stop()` logic so stopping one instance no longer kills the update loop for all other active clocks.

## [2.0.0] - 2026-02-03

### Changed
- **Breaking Change**: Renamed `.jumping()` to `.motionStyle()` for better semantic clarity.
- **Terminology Update**: Changed motion style name `'master-slave'` to `'impulse'`.
- **API Extension**: Changed motion settings from Booleans to String-based categories (`'none'`, `'jumping'`, `'smooth'`, `'impulse'`).

## [1.0.0] - 2026-02-03
- Initial release of the ClockBuilder engine.
- Support for Base64 encoded assets and global RAF loop.