# About photo subject labels

`src/data/photo-subject-labels.json` is the authoritative subject-label manifest for the 79 photos the owner explicitly confirmed show Chanel Monroe on 29 November 2026.

- Match an image by `source`, or by `storage_bucket` plus `storage_object` in Supabase. Review numbers refer to the fixed 225-photo picker in `docs/about-photo-review.json`; do not renumber them when changing gallery order.
- `subject_id: "chanel"` and `subject: "Chanel Monroe"` describe the depicted subject. They do not claim she created the makeup or photography.
- Every record retains owner confirmation and its date. Do not extend identity labels to other photos by face matching, shared post, or filename similarity.
- Unlisted images have no confirmed subject label. Labels do not make a low-quality image suitable for the site or change gallery visibility.
- Update this manifest and the review together when the owner adds or corrects a label. Retain the original Supabase object; this manifest does not embed EXIF/XMP or change Storage metadata.

This metadata is checked into GitHub for future editorial work. Runtime gallery grouping can consume these exact source/object mappings when requested.
