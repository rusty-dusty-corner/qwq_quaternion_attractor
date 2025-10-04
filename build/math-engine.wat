(module
 (type $0 (func (param i32 i32)))
 (type $1 (func (param i32) (result i32)))
 (type $2 (func (param i32 f32)))
 (type $3 (func (param i32)))
 (type $4 (func (param i32 i32) (result i32)))
 (type $5 (func))
 (type $6 (func (param i32 i32) (result f32)))
 (type $7 (func (param i32 i32 i32 i32)))
 (type $8 (func (param i32 i32 f32)))
 (type $9 (func (param i32) (result f32)))
 (type $10 (func (param i32 i32 i32 i32 i32) (result i32)))
 (type $11 (func (param i32 i32 f32 f32 f32 f32 f32 f32 i32 f32 f32 f32 f32) (result i32)))
 (type $12 (func (param i32 f32 f32 f32)))
 (type $13 (func (param i32 i32 i32) (result i32)))
 (type $14 (func (param i32 i32 f32 f32 f32 f32 f32 f32 i32 f32 f32 f32 f32)))
 (type $15 (func (result i32)))
 (import "env" "table" (table $0 1 funcref))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $src/wasm/function-api/engines (mut i32) (i32.const 1088))
 (global $src/wasm/function-api/nextEngineId (mut i32) (i32.const 0))
 (global $src/wasm/function-api/SIDE_FLIP_PLAIN i32 (i32.const 0))
 (global $src/wasm/function-api/SIDE_FLIP_SMALLEST i32 (i32.const 1))
 (global $src/wasm/function-api/SIDE_FLIP_ALL_EXCEPT_LARGEST i32 (i32.const 2))
 (global $~lib/rt/stub/offset (mut i32) (i32.const 0))
 (global $~lib/rt/__rtti_base i32 (i32.const 1696))
 (memory $0 1)
 (data $0 (i32.const 1036) "\1c")
 (data $0.1 (i32.const 1048) "\01")
 (data $1 (i32.const 1068) ",")
 (data $1.1 (i32.const 1080) "\08\00\00\00\10\00\00\00 \04\00\00 \04")
 (data $2 (i32.const 1116) "<")
 (data $2.1 (i32.const 1128) "\02\00\00\00$\00\00\00I\00n\00d\00e\00x\00 \00o\00u\00t\00 \00o\00f\00 \00r\00a\00n\00g\00e")
 (data $3 (i32.const 1180) "<")
 (data $3.1 (i32.const 1192) "\02\00\00\00$\00\00\00~\00l\00i\00b\00/\00t\00y\00p\00e\00d\00a\00r\00r\00a\00y\00.\00t\00s")
 (data $4 (i32.const 1244) ",")
 (data $4.1 (i32.const 1256) "\02\00\00\00\1c\00\00\00I\00n\00v\00a\00l\00i\00d\00 \00l\00e\00n\00g\00t\00h")
 (data $5 (i32.const 1292) "<")
 (data $5.1 (i32.const 1304) "\02\00\00\00&\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00b\00u\00f\00f\00e\00r\00.\00t\00s")
 (data $6 (i32.const 1356) "<")
 (data $6.1 (i32.const 1368) "\02\00\00\00(\00\00\00A\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e")
 (data $7 (i32.const 1420) "<")
 (data $7.1 (i32.const 1432) "\02\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00s\00t\00u\00b\00.\00t\00s")
 (data $8 (i32.const 1484) ",")
 (data $8.1 (i32.const 1496) "\02\00\00\00\1a\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00.\00t\00s")
 (data $9 (i32.const 1532) "|")
 (data $9.1 (i32.const 1544) "\02\00\00\00^\00\00\00E\00l\00e\00m\00e\00n\00t\00 \00t\00y\00p\00e\00 \00m\00u\00s\00t\00 \00b\00e\00 \00n\00u\00l\00l\00a\00b\00l\00e\00 \00i\00f\00 \00a\00r\00r\00a\00y\00 \00i\00s\00 \00h\00o\00l\00e\00y")
 (data $10 (i32.const 1660) "\1c")
 (data $10.1 (i32.const 1672) "\01")
 (data $11 (i32.const 1696) "\0b\00\00\00 \00\00\00 \00\00\00 ")
 (data $11.1 (i32.const 1720) "\01\19\00\00 \00\00\00\00\00\00\00\02A\00\00 \00\00\00\02\t")
 (export "normalizeQuaternion" (func $src/wasm/quaternion-math/normalizeQuaternion))
 (export "quaternionMultiply" (func $src/wasm/quaternion-math/quaternionMultiply))
 (export "stereographicProjection" (func $src/wasm/quaternion-math/stereographicProjection))
 (export "inverseStereographicProjection" (func $src/wasm/quaternion-math/inverseStereographicProjection))
 (export "rotateVector" (func $src/wasm/quaternion-math/rotateVector))
 (export "distance3D" (func $src/wasm/quaternion-math/distance3D))
 (export "magnitude3D" (func $src/wasm/quaternion-math/magnitude3D))
 (export "createAttractorEngine" (func $src/wasm/function-api/createAttractorEngine))
 (export "generatePoints" (func $src/wasm/function-api/generatePoints))
 (export "getPointCount" (func $src/wasm/function-api/getPointCount))
 (export "getPointRange" (func $src/wasm/function-api/getPointRange))
 (export "getAllPoints" (func $src/wasm/function-api/getAllPoints))
 (export "getStatistics" (func $src/wasm/function-api/getStatistics))
 (export "getCurrentState" (func $src/wasm/function-api/getCurrentState))
 (export "updateConfig" (func $src/wasm/function-api/updateConfig))
 (export "resetEngine" (func $src/wasm/function-api/resetEngine))
 (export "getEngineCount" (func $src/wasm/function-api/getEngineCount))
 (export "clearAllEngines" (func $src/wasm/function-api/clearAllEngines))
 (export "SIDE_FLIP_PLAIN" (global $src/wasm/function-api/SIDE_FLIP_PLAIN))
 (export "SIDE_FLIP_SMALLEST" (global $src/wasm/function-api/SIDE_FLIP_SMALLEST))
 (export "SIDE_FLIP_ALL_EXCEPT_LARGEST" (global $src/wasm/function-api/SIDE_FLIP_ALL_EXCEPT_LARGEST))
 (export "__new" (func $~lib/rt/stub/__new))
 (export "__pin" (func $~lib/rt/stub/__pin))
 (export "__unpin" (func $~lib/rt/stub/__unpin))
 (export "__collect" (func $~lib/rt/stub/__collect))
 (export "__rtti_base" (global $~lib/rt/__rtti_base))
 (export "memory" (memory $0))
 (export "table" (table $0))
 (start $~start)
 (func $~lib/typedarray/Float32Array#__get (param $0 i32) (param $1 i32) (result f32)
  local.get $1
  local.get $0
  i32.load offset=8
  i32.const 2
  i32.shr_u
  i32.ge_u
  if
   i32.const 1136
   i32.const 1200
   i32.const 1304
   i32.const 64
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  f32.load
 )
 (func $~lib/rt/stub/maybeGrowMemory (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  memory.size
  local.tee $1
  i32.const 16
  i32.shl
  i32.const 15
  i32.add
  i32.const -16
  i32.and
  local.tee $2
  local.get $0
  i32.lt_u
  if
   local.get $1
   local.get $0
   local.get $2
   i32.sub
   i32.const 65535
   i32.add
   i32.const -65536
   i32.and
   i32.const 16
   i32.shr_u
   local.tee $2
   local.get $1
   local.get $2
   i32.gt_s
   select
   memory.grow
   i32.const 0
   i32.lt_s
   if
    local.get $2
    memory.grow
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
   end
  end
  local.get $0
  global.set $~lib/rt/stub/offset
 )
 (func $~lib/rt/common/BLOCK#set:mmInfo (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store
 )
 (func $~lib/rt/stub/__alloc (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  i32.const 1073741820
  i32.gt_u
  if
   i32.const 1376
   i32.const 1440
   i32.const 33
   i32.const 29
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/rt/stub/offset
  local.set $1
  global.get $~lib/rt/stub/offset
  i32.const 4
  i32.add
  local.tee $2
  local.get $0
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.tee $0
  i32.add
  call $~lib/rt/stub/maybeGrowMemory
  local.get $1
  local.get $0
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $2
 )
 (func $~lib/rt/common/OBJECT#set:gcInfo (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=4
 )
 (func $~lib/rt/common/OBJECT#set:gcInfo2 (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=8
 )
 (func $~lib/rt/common/OBJECT#set:rtId (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=12
 )
 (func $~lib/rt/common/OBJECT#set:rtSize (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=16
 )
 (func $~lib/rt/stub/__new (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 1073741804
  i32.gt_u
  if
   i32.const 1376
   i32.const 1440
   i32.const 86
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 16
  i32.add
  call $~lib/rt/stub/__alloc
  local.tee $3
  i32.const 4
  i32.sub
  local.tee $2
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo
  local.get $2
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo2
  local.get $2
  local.get $1
  call $~lib/rt/common/OBJECT#set:rtId
  local.get $2
  local.get $0
  call $~lib/rt/common/OBJECT#set:rtSize
  local.get $3
  i32.const 16
  i32.add
 )
 (func $~lib/typedarray/Float32Array#constructor (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  i32.const 12
  i32.const 5
  call $~lib/rt/stub/__new
  local.tee $1
  i32.eqz
  if
   i32.const 12
   i32.const 3
   call $~lib/rt/stub/__new
   local.set $1
  end
  local.get $1
  i32.const 0
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $1
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo
  local.get $1
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo2
  local.get $0
  i32.const 268435455
  i32.gt_u
  if
   i32.const 1264
   i32.const 1312
   i32.const 19
   i32.const 57
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 2
  i32.shl
  local.tee $0
  i32.const 1
  call $~lib/rt/stub/__new
  local.tee $2
  i32.const 0
  local.get $0
  memory.fill
  local.get $1
  local.get $2
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $1
  local.get $2
  call $~lib/rt/common/OBJECT#set:gcInfo
  local.get $1
  local.get $0
  call $~lib/rt/common/OBJECT#set:gcInfo2
  local.get $1
 )
 (func $~lib/typedarray/Float32Array#__set (param $0 i32) (param $1 i32) (param $2 f32)
  local.get $1
  local.get $0
  i32.load offset=8
  i32.const 2
  i32.shr_u
  i32.ge_u
  if
   i32.const 1136
   i32.const 1200
   i32.const 1315
   i32.const 64
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  local.get $2
  f32.store
 )
 (func $src/wasm/quaternion-math/normalizeQuaternion (param $0 i32) (result i32)
  (local $1 f32)
  (local $2 f32)
  (local $3 f32)
  (local $4 f32)
  (local $5 f32)
  local.get $0
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  local.tee $2
  local.get $2
  f32.mul
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.tee $3
  local.get $3
  f32.mul
  f32.add
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.tee $4
  local.get $4
  f32.mul
  f32.add
  local.get $0
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  local.tee $5
  local.get $5
  f32.mul
  f32.add
  f64.promote_f32
  f64.sqrt
  f32.demote_f64
  local.tee $1
  f32.const 0
  f32.eq
  if
   i32.const 4
   call $~lib/typedarray/Float32Array#constructor
   local.tee $0
   i32.const 0
   f32.const 1
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 1
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 2
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 3
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   return
  end
  i32.const 4
  call $~lib/typedarray/Float32Array#constructor
  local.tee $0
  i32.const 0
  local.get $2
  local.get $1
  f32.div
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 1
  local.get $3
  local.get $1
  f32.div
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 2
  local.get $4
  local.get $1
  f32.div
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 3
  local.get $5
  local.get $1
  f32.div
  call $~lib/typedarray/Float32Array#__set
  local.get $0
 )
 (func $src/wasm/quaternion-math/quaternionMultiply (param $0 i32) (param $1 i32) (result i32)
  (local $2 f32)
  (local $3 f32)
  (local $4 f32)
  (local $5 f32)
  (local $6 f32)
  (local $7 f32)
  (local $8 f32)
  (local $9 f32)
  local.get $0
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  local.set $2
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.set $3
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.set $4
  local.get $0
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  local.set $5
  local.get $1
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  local.set $6
  local.get $1
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.set $7
  local.get $1
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.set $8
  local.get $1
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  local.set $9
  i32.const 4
  call $~lib/typedarray/Float32Array#constructor
  local.tee $0
  i32.const 0
  local.get $2
  local.get $6
  f32.mul
  local.get $3
  local.get $7
  f32.mul
  f32.sub
  local.get $4
  local.get $8
  f32.mul
  f32.sub
  local.get $5
  local.get $9
  f32.mul
  f32.sub
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 1
  local.get $2
  local.get $7
  f32.mul
  local.get $3
  local.get $6
  f32.mul
  f32.add
  local.get $4
  local.get $9
  f32.mul
  f32.add
  local.get $5
  local.get $8
  f32.mul
  f32.sub
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 2
  local.get $2
  local.get $8
  f32.mul
  local.get $3
  local.get $9
  f32.mul
  f32.sub
  local.get $4
  local.get $6
  f32.mul
  f32.add
  local.get $5
  local.get $7
  f32.mul
  f32.add
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 3
  local.get $2
  local.get $9
  f32.mul
  local.get $3
  local.get $8
  f32.mul
  f32.add
  local.get $4
  local.get $7
  f32.mul
  f32.sub
  local.get $5
  local.get $6
  f32.mul
  f32.add
  call $~lib/typedarray/Float32Array#__set
  local.get $0
 )
 (func $src/wasm/quaternion-math/stereographicProjection (param $0 i32) (result i32)
  (local $1 f32)
  (local $2 f64)
  (local $3 f32)
  (local $4 f32)
  (local $5 f32)
  local.get $0
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  local.set $1
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.set $3
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.set $4
  local.get $0
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  local.set $5
  f64.const 1
  local.get $1
  f64.promote_f32
  f64.sub
  f64.abs
  f64.const 1e-10
  f64.lt
  if
   i32.const 3
   call $~lib/typedarray/Float32Array#constructor
   local.tee $0
   i32.const 0
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 1
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 2
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   return
  end
  i32.const 3
  call $~lib/typedarray/Float32Array#constructor
  local.tee $0
  i32.const 0
  local.get $3
  f64.promote_f32
  f64.const 1
  f64.const 1
  local.get $1
  f64.promote_f32
  f64.sub
  f64.div
  local.tee $2
  f64.mul
  f32.demote_f64
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 1
  local.get $4
  f64.promote_f32
  local.get $2
  f64.mul
  f32.demote_f64
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 2
  local.get $5
  f64.promote_f32
  local.get $2
  f64.mul
  f32.demote_f64
  call $~lib/typedarray/Float32Array#__set
  local.get $0
 )
 (func $src/wasm/quaternion-math/inverseStereographicProjection (param $0 i32) (result i32)
  (local $1 f32)
  (local $2 f32)
  (local $3 f32)
  (local $4 f64)
  (local $5 f32)
  local.get $0
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  local.tee $1
  local.get $1
  f32.mul
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.tee $2
  local.get $2
  f32.mul
  f32.add
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.tee $3
  local.get $3
  f32.mul
  f32.add
  local.tee $5
  f32.const 1.000000013351432e-10
  f32.lt
  if
   i32.const 4
   call $~lib/typedarray/Float32Array#constructor
   local.tee $0
   i32.const 0
   f32.const 1
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 1
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 2
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 3
   f32.const 0
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   return
  end
  i32.const 4
  call $~lib/typedarray/Float32Array#constructor
  local.tee $0
  i32.const 0
  local.get $5
  f32.const -1
  f32.add
  local.get $5
  f32.const 1
  f32.add
  local.tee $5
  f32.div
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 1
  local.get $1
  f64.promote_f32
  f64.const 2
  local.get $5
  f64.promote_f32
  f64.div
  local.tee $4
  f64.mul
  f32.demote_f64
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 2
  local.get $2
  f64.promote_f32
  local.get $4
  f64.mul
  f32.demote_f64
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  i32.const 3
  local.get $3
  f64.promote_f32
  local.get $4
  f64.mul
  f32.demote_f64
  call $~lib/typedarray/Float32Array#__set
  local.get $0
 )
 (func $src/wasm/quaternion-math/rotateVector (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  i32.const 4
  call $~lib/typedarray/Float32Array#constructor
  local.tee $2
  i32.const 0
  f32.const 0
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  i32.const 1
  local.get $0
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  i32.const 2
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  i32.const 3
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  call $~lib/typedarray/Float32Array#__set
  local.get $1
  local.get $2
  call $src/wasm/quaternion-math/quaternionMultiply
  local.set $0
  i32.const 4
  call $~lib/typedarray/Float32Array#constructor
  local.tee $2
  i32.const 0
  local.get $1
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  i32.const 1
  local.get $1
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  f32.neg
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  i32.const 2
  local.get $1
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  f32.neg
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  i32.const 3
  local.get $1
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  f32.neg
  call $~lib/typedarray/Float32Array#__set
  local.get $0
  local.get $2
  call $src/wasm/quaternion-math/quaternionMultiply
  local.set $0
  i32.const 3
  call $~lib/typedarray/Float32Array#constructor
  local.tee $1
  i32.const 0
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  call $~lib/typedarray/Float32Array#__set
  local.get $1
  i32.const 1
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  call $~lib/typedarray/Float32Array#__set
  local.get $1
  i32.const 2
  local.get $0
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  call $~lib/typedarray/Float32Array#__set
  local.get $1
 )
 (func $src/wasm/quaternion-math/distance3D (param $0 i32) (param $1 i32) (result f32)
  (local $2 f32)
  local.get $0
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  local.get $1
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  f32.sub
  local.tee $2
  local.get $2
  f32.mul
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.get $1
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  f32.sub
  local.tee $2
  local.get $2
  f32.mul
  f32.add
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.get $1
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  f32.sub
  local.tee $2
  local.get $2
  f32.mul
  f32.add
  f64.promote_f32
  f64.sqrt
  f32.demote_f64
 )
 (func $src/wasm/quaternion-math/magnitude3D (param $0 i32) (result f32)
  local.get $0
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  local.get $0
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  f32.mul
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.get $0
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  f32.mul
  f32.add
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.get $0
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  f32.mul
  f32.add
  f64.promote_f32
  f64.sqrt
  f32.demote_f64
 )
 (func $src/wasm/attractor-engine/AttractorConfig#constructor (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (result i32)
  (local $5 i32)
  i32.const 20
  i32.const 7
  call $~lib/rt/stub/__new
  local.tee $5
  i32.const 0
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $5
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo
  local.get $5
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo2
  local.get $5
  i32.const 0
  call $~lib/rt/common/OBJECT#set:rtId
  local.get $5
  i32.const 0
  call $~lib/rt/common/OBJECT#set:rtSize
  local.get $5
  local.get $0
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $5
  local.get $1
  call $~lib/rt/common/OBJECT#set:gcInfo
  local.get $5
  local.get $2
  call $~lib/rt/common/OBJECT#set:gcInfo2
  local.get $5
  local.get $3
  call $~lib/rt/common/OBJECT#set:rtId
  local.get $5
  local.get $4
  call $~lib/rt/common/OBJECT#set:rtSize
  local.get $5
 )
 (func $src/wasm/attractor-engine/AttractorEngine#set:currentX (param $0 i32) (param $1 f32)
  local.get $0
  local.get $1
  f32.store offset=16
 )
 (func $src/wasm/attractor-engine/AttractorEngine#set:currentY (param $0 i32) (param $1 f32)
  local.get $0
  local.get $1
  f32.store offset=20
 )
 (func $src/wasm/attractor-engine/AttractorEngine#set:currentZ (param $0 i32) (param $1 f32)
  local.get $0
  local.get $1
  f32.store offset=24
 )
 (func $src/wasm/attractor-engine/AttractorEngine#set:currentSide (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=28
 )
 (func $src/wasm/attractor-engine/AttractorEngine#set:sideFlipCount (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=32
 )
 (func $src/wasm/attractor-engine/AttractorEngine#set:totalSteps (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=36
 )
 (func $~lib/rt/stub/__realloc (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  i32.const 15
  i32.and
  i32.const 1
  local.get $0
  select
  if
   i32.const 0
   i32.const 1440
   i32.const 45
   i32.const 3
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/rt/stub/offset
  local.get $0
  i32.const 4
  i32.sub
  local.tee $4
  i32.load
  local.tee $3
  local.get $0
  i32.add
  i32.eq
  local.set $5
  local.get $1
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.set $2
  local.get $1
  local.get $3
  i32.gt_u
  if
   local.get $5
   if
    local.get $1
    i32.const 1073741820
    i32.gt_u
    if
     i32.const 1376
     i32.const 1440
     i32.const 52
     i32.const 33
     call $~lib/builtins/abort
     unreachable
    end
    local.get $0
    local.get $2
    i32.add
    call $~lib/rt/stub/maybeGrowMemory
    local.get $4
    local.get $2
    call $~lib/rt/common/BLOCK#set:mmInfo
   else
    local.get $2
    local.get $3
    i32.const 1
    i32.shl
    local.tee $1
    local.get $1
    local.get $2
    i32.lt_u
    select
    call $~lib/rt/stub/__alloc
    local.tee $1
    local.get $0
    local.get $3
    memory.copy
    local.get $1
    local.set $0
   end
  else
   local.get $5
   if
    local.get $0
    local.get $2
    i32.add
    global.set $~lib/rt/stub/offset
    local.get $4
    local.get $2
    call $~lib/rt/common/BLOCK#set:mmInfo
   end
  end
  local.get $0
 )
 (func $~lib/array/ensureCapacity (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $1
  local.get $0
  i32.load offset=8
  local.tee $2
  i32.const 2
  i32.shr_u
  i32.gt_u
  if
   local.get $1
   i32.const 268435455
   i32.gt_u
   if
    i32.const 1264
    i32.const 1504
    i32.const 19
    i32.const 48
    call $~lib/builtins/abort
    unreachable
   end
   local.get $0
   i32.load
   local.set $3
   i32.const 1073741820
   local.get $2
   i32.const 1
   i32.shl
   local.tee $4
   local.get $4
   i32.const 1073741820
   i32.ge_u
   select
   local.tee $4
   i32.const 8
   local.get $1
   local.get $1
   i32.const 8
   i32.le_u
   select
   i32.const 2
   i32.shl
   local.tee $1
   local.get $1
   local.get $4
   i32.lt_u
   select
   local.tee $1
   i32.const 1073741804
   i32.gt_u
   if
    i32.const 1376
    i32.const 1440
    i32.const 99
    i32.const 30
    call $~lib/builtins/abort
    unreachable
   end
   local.get $3
   i32.const 16
   i32.sub
   local.get $1
   i32.const 16
   i32.add
   call $~lib/rt/stub/__realloc
   local.tee $4
   i32.const 4
   i32.sub
   local.get $1
   call $~lib/rt/common/OBJECT#set:rtSize
   local.get $4
   i32.const 16
   i32.add
   local.tee $4
   local.get $2
   i32.add
   i32.const 0
   local.get $1
   local.get $2
   i32.sub
   memory.fill
   local.get $3
   local.get $4
   i32.ne
   if
    local.get $0
    local.get $4
    i32.store
    local.get $0
    local.get $4
    i32.store offset=4
   end
   local.get $0
   local.get $1
   i32.store offset=8
  end
 )
 (func $src/wasm/function-api/createAttractorEngine (param $0 i32) (param $1 i32) (param $2 f32) (param $3 f32) (param $4 f32) (param $5 f32) (param $6 f32) (param $7 f32) (param $8 i32) (param $9 f32) (param $10 f32) (param $11 f32) (param $12 f32) (result i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  i32.const 3
  call $~lib/typedarray/Float32Array#constructor
  local.tee $14
  i32.const 0
  local.get $2
  call $~lib/typedarray/Float32Array#__set
  local.get $14
  i32.const 1
  local.get $3
  call $~lib/typedarray/Float32Array#__set
  local.get $14
  i32.const 2
  local.get $4
  call $~lib/typedarray/Float32Array#__set
  i32.const 3
  call $~lib/typedarray/Float32Array#constructor
  local.tee $15
  i32.const 0
  local.get $5
  call $~lib/typedarray/Float32Array#__set
  local.get $15
  i32.const 1
  local.get $6
  call $~lib/typedarray/Float32Array#__set
  local.get $15
  i32.const 2
  local.get $7
  call $~lib/typedarray/Float32Array#__set
  i32.const 4
  call $~lib/typedarray/Float32Array#constructor
  local.tee $13
  i32.const 0
  local.get $9
  call $~lib/typedarray/Float32Array#__set
  local.get $13
  i32.const 1
  local.get $10
  call $~lib/typedarray/Float32Array#__set
  local.get $13
  i32.const 2
  local.get $11
  call $~lib/typedarray/Float32Array#__set
  local.get $13
  i32.const 3
  local.get $12
  call $~lib/typedarray/Float32Array#__set
  local.get $1
  local.get $14
  local.get $15
  local.get $8
  local.get $13
  call $src/wasm/attractor-engine/AttractorConfig#constructor
  local.set $1
  i32.const 40
  i32.const 4
  call $~lib/rt/stub/__new
  local.tee $8
  i32.const 0
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $8
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo
  local.get $8
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo2
  local.get $8
  i32.const 0
  call $~lib/rt/common/OBJECT#set:rtId
  local.get $8
  f32.const 0
  call $src/wasm/attractor-engine/AttractorEngine#set:currentX
  local.get $8
  f32.const 0
  call $src/wasm/attractor-engine/AttractorEngine#set:currentY
  local.get $8
  f32.const 0
  call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
  local.get $8
  i32.const 1
  call $src/wasm/attractor-engine/AttractorEngine#set:currentSide
  local.get $8
  i32.const 0
  call $src/wasm/attractor-engine/AttractorEngine#set:sideFlipCount
  local.get $8
  i32.const 0
  call $src/wasm/attractor-engine/AttractorEngine#set:totalSteps
  local.get $8
  local.get $0
  i32.const 2
  i32.shl
  call $~lib/typedarray/Float32Array#constructor
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $1
  i32.load
  local.set $0
  i32.const 4
  i32.const 6
  call $~lib/rt/stub/__new
  local.tee $13
  i32.const 0
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $13
  local.get $0
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $8
  local.get $13
  call $~lib/rt/common/OBJECT#set:gcInfo2
  local.get $8
  local.get $1
  call $~lib/rt/common/OBJECT#set:rtId
  local.get $8
  local.get $1
  i32.load offset=8
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  call $src/wasm/attractor-engine/AttractorEngine#set:currentX
  local.get $8
  local.get $1
  i32.load offset=8
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  call $src/wasm/attractor-engine/AttractorEngine#set:currentY
  local.get $8
  local.get $1
  i32.load offset=8
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
  local.get $8
  i32.const 1
  call $src/wasm/attractor-engine/AttractorEngine#set:currentSide
  global.get $src/wasm/function-api/nextEngineId
  local.tee $0
  i32.const 1
  i32.add
  global.set $src/wasm/function-api/nextEngineId
  global.get $src/wasm/function-api/engines
  local.tee $1
  i32.load offset=12
  local.tee $13
  i32.const 1
  i32.add
  local.set $14
  local.get $1
  local.get $14
  call $~lib/array/ensureCapacity
  local.get $1
  i32.load offset=4
  local.get $13
  i32.const 2
  i32.shl
  i32.add
  local.get $8
  i32.store
  local.get $1
  local.get $14
  call $~lib/rt/common/OBJECT#set:rtId
  local.get $0
 )
 (func $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  local.get $0
  i32.load offset=12
  i32.ge_u
  if
   i32.const 1136
   i32.const 1504
   i32.const 114
   i32.const 42
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.tee $0
  i32.eqz
  if
   i32.const 1552
   i32.const 1504
   i32.const 118
   i32.const 40
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
 )
 (func $src/wasm/deterministic-random/DeterministicRandom#setSeed (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  call $~lib/rt/common/BLOCK#set:mmInfo
 )
 (func $src/wasm/attractor-engine/AttractorEngine#applySideFlipVariation (param $0 i32) (param $1 f32) (param $2 f32) (param $3 f32)
  (local $4 f64)
  (local $5 i32)
  (local $6 f64)
  (local $7 f64)
  block $break|0
   block $case1|0
    local.get $0
    i32.load offset=12
    i32.load offset=12
    local.tee $5
    i32.const 1
    i32.ne
    if
     local.get $5
     i32.const 2
     i32.eq
     br_if $case1|0
     br $break|0
    end
    local.get $1
    f64.promote_f32
    f64.abs
    local.tee $4
    local.get $3
    f64.promote_f32
    f64.abs
    local.tee $6
    f64.le
    local.get $2
    f64.promote_f32
    f64.abs
    local.tee $7
    local.get $4
    f64.ge
    i32.and
    if
     local.get $0
     local.get $1
     f32.neg
     call $src/wasm/attractor-engine/AttractorEngine#set:currentX
     local.get $0
     local.get $2
     call $src/wasm/attractor-engine/AttractorEngine#set:currentY
     local.get $0
     local.get $3
     call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
    else
     local.get $6
     local.get $7
     f64.ge
     local.get $4
     local.get $7
     f64.ge
     i32.and
     if
      local.get $0
      local.get $1
      call $src/wasm/attractor-engine/AttractorEngine#set:currentX
      local.get $0
      local.get $2
      f32.neg
      call $src/wasm/attractor-engine/AttractorEngine#set:currentY
      local.get $0
      local.get $3
      call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
     else
      local.get $0
      local.get $1
      call $src/wasm/attractor-engine/AttractorEngine#set:currentX
      local.get $0
      local.get $2
      call $src/wasm/attractor-engine/AttractorEngine#set:currentY
      local.get $0
      local.get $3
      f32.neg
      call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
     end
    end
    br $break|0
   end
   local.get $1
   f64.promote_f32
   f64.abs
   local.tee $4
   local.get $3
   f64.promote_f32
   f64.abs
   local.tee $6
   f64.ge
   local.get $2
   f64.promote_f32
   f64.abs
   local.tee $7
   local.get $4
   f64.le
   i32.and
   if
    local.get $0
    local.get $1
    call $src/wasm/attractor-engine/AttractorEngine#set:currentX
    local.get $0
    local.get $2
    f32.neg
    call $src/wasm/attractor-engine/AttractorEngine#set:currentY
    local.get $0
    local.get $3
    f32.neg
    call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
   else
    local.get $4
    local.get $7
    f64.le
    local.get $6
    local.get $7
    f64.le
    i32.and
    if
     local.get $0
     local.get $1
     f32.neg
     call $src/wasm/attractor-engine/AttractorEngine#set:currentX
     local.get $0
     local.get $2
     call $src/wasm/attractor-engine/AttractorEngine#set:currentY
     local.get $0
     local.get $3
     f32.neg
     call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
    else
     local.get $0
     local.get $1
     f32.neg
     call $src/wasm/attractor-engine/AttractorEngine#set:currentX
     local.get $0
     local.get $2
     f32.neg
     call $src/wasm/attractor-engine/AttractorEngine#set:currentY
     local.get $0
     local.get $3
     call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
    end
   end
  end
 )
 (func $src/wasm/attractor-engine/AttractorEngine#applyGlobalRotation (param $0 i32)
  (local $1 f32)
  (local $2 i32)
  i32.const 3
  call $~lib/typedarray/Float32Array#constructor
  local.tee $2
  i32.const 0
  local.get $0
  f32.load offset=16
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  i32.const 1
  local.get $0
  f32.load offset=20
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  i32.const 2
  local.get $0
  f32.load offset=24
  call $~lib/typedarray/Float32Array#__set
  local.get $2
  call $src/wasm/quaternion-math/inverseStereographicProjection
  local.set $2
  local.get $0
  i32.load offset=12
  i32.load offset=16
  local.get $2
  call $src/wasm/quaternion-math/quaternionMultiply
  call $src/wasm/quaternion-math/normalizeQuaternion
  local.tee $2
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.get $2
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  f32.mul
  local.get $2
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.get $2
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  f32.mul
  f32.add
  local.get $2
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  local.get $2
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  f32.mul
  f32.add
  f32.const 1
  f32.add
  local.set $1
  local.get $0
  local.get $2
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  f32.const 2
  f32.mul
  local.get $1
  f32.div
  call $src/wasm/attractor-engine/AttractorEngine#set:currentX
  local.get $0
  local.get $2
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  f32.const 2
  f32.mul
  local.get $1
  f32.div
  call $src/wasm/attractor-engine/AttractorEngine#set:currentY
  local.get $0
  local.get $2
  i32.const 3
  call $~lib/typedarray/Float32Array#__get
  f32.const 2
  f32.mul
  local.get $1
  f32.div
  call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
  local.get $0
  i32.const 1
  i32.const -1
  local.get $2
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  f32.const 0
  f32.ge
  select
  call $src/wasm/attractor-engine/AttractorEngine#set:currentSide
 )
 (func $src/wasm/attractor-engine/AttractorEngine#generateNextPoint (param $0 i32)
  (local $1 i32)
  (local $2 f32)
  (local $3 f32)
  (local $4 f32)
  local.get $0
  f32.load offset=16
  local.get $0
  i32.load offset=12
  i32.load offset=4
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  local.get $0
  i32.load offset=28
  f32.convert_i32_s
  f32.mul
  f32.add
  local.tee $2
  local.get $2
  f32.mul
  local.get $0
  f32.load offset=20
  local.get $0
  i32.load offset=12
  i32.load offset=4
  i32.const 1
  call $~lib/typedarray/Float32Array#__get
  local.get $0
  i32.load offset=28
  f32.convert_i32_s
  f32.mul
  f32.add
  local.tee $3
  local.get $3
  f32.mul
  f32.add
  local.get $0
  f32.load offset=24
  local.get $0
  i32.load offset=12
  i32.load offset=4
  i32.const 2
  call $~lib/typedarray/Float32Array#__get
  local.get $0
  i32.load offset=28
  f32.convert_i32_s
  f32.mul
  f32.add
  local.tee $4
  local.get $4
  f32.mul
  f32.add
  f64.promote_f32
  f64.sqrt
  f32.demote_f64
  f32.const 1
  f32.gt
  if
   local.get $0
   local.get $2
   local.get $3
   local.get $4
   call $src/wasm/attractor-engine/AttractorEngine#applySideFlipVariation
   local.get $0
   i32.const 0
   local.get $0
   i32.load offset=28
   i32.sub
   call $src/wasm/attractor-engine/AttractorEngine#set:currentSide
   local.get $0
   local.get $0
   i32.load offset=32
   i32.const 1
   i32.add
   call $src/wasm/attractor-engine/AttractorEngine#set:sideFlipCount
  else
   local.get $0
   local.get $2
   call $src/wasm/attractor-engine/AttractorEngine#set:currentX
   local.get $0
   local.get $3
   call $src/wasm/attractor-engine/AttractorEngine#set:currentY
   local.get $0
   local.get $4
   call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
  end
  local.get $0
  i32.load offset=12
  i32.load offset=16
  i32.const 0
  call $~lib/typedarray/Float32Array#__get
  f32.const 1
  f32.ne
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=12
   i32.load offset=16
   i32.const 1
   call $~lib/typedarray/Float32Array#__get
   f32.const 0
   f32.ne
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=12
   i32.load offset=16
   i32.const 2
   call $~lib/typedarray/Float32Array#__get
   f32.const 0
   f32.ne
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=12
   i32.load offset=16
   i32.const 3
   call $~lib/typedarray/Float32Array#__get
   f32.const 0
   f32.ne
  end
  if
   local.get $0
   call $src/wasm/attractor-engine/AttractorEngine#applyGlobalRotation
  end
  local.get $0
  i32.load offset=4
  i32.const 2
  i32.shl
  local.tee $1
  local.get $0
  i32.load
  i32.load offset=8
  i32.const 2
  i32.shr_u
  i32.lt_s
  if
   local.get $0
   i32.load
   local.get $1
   local.get $0
   f32.load offset=16
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.load
   local.get $1
   i32.const 1
   i32.add
   local.get $0
   f32.load offset=20
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.load
   local.get $1
   i32.const 2
   i32.add
   local.get $0
   f32.load offset=24
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.load
   local.get $1
   i32.const 3
   i32.add
   local.get $0
   i32.load offset=28
   f32.convert_i32_s
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   local.get $0
   i32.load offset=4
   i32.const 1
   i32.add
   call $~lib/rt/common/OBJECT#set:gcInfo
  end
 )
 (func $src/wasm/function-api/generatePoints (param $0 i32) (param $1 i32)
  (local $2 i32)
  local.get $0
  i32.const 0
  i32.ge_s
  if (result i32)
   local.get $0
   global.get $src/wasm/function-api/engines
   i32.load offset=12
   i32.lt_s
  else
   i32.const 0
  end
  if
   global.get $src/wasm/function-api/engines
   local.get $0
   call $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get
   local.tee $0
   i32.const 0
   call $~lib/rt/common/OBJECT#set:gcInfo
   local.get $0
   i32.const 0
   call $src/wasm/attractor-engine/AttractorEngine#set:sideFlipCount
   local.get $0
   i32.const 0
   call $src/wasm/attractor-engine/AttractorEngine#set:totalSteps
   local.get $0
   local.get $0
   i32.load offset=12
   i32.load offset=8
   i32.const 0
   call $~lib/typedarray/Float32Array#__get
   call $src/wasm/attractor-engine/AttractorEngine#set:currentX
   local.get $0
   local.get $0
   i32.load offset=12
   i32.load offset=8
   i32.const 1
   call $~lib/typedarray/Float32Array#__get
   call $src/wasm/attractor-engine/AttractorEngine#set:currentY
   local.get $0
   local.get $0
   i32.load offset=12
   i32.load offset=8
   i32.const 2
   call $~lib/typedarray/Float32Array#__get
   call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
   local.get $0
   i32.const 1
   call $src/wasm/attractor-engine/AttractorEngine#set:currentSide
   local.get $0
   i32.load offset=8
   local.get $0
   i32.load offset=12
   i32.load
   call $src/wasm/deterministic-random/DeterministicRandom#setSeed
   loop $for-loop|0
    local.get $1
    local.get $2
    i32.gt_s
    if
     local.get $0
     call $src/wasm/attractor-engine/AttractorEngine#generateNextPoint
     local.get $0
     local.get $0
     i32.load offset=36
     i32.const 1
     i32.add
     call $src/wasm/attractor-engine/AttractorEngine#set:totalSteps
     local.get $2
     i32.const 1
     i32.add
     local.set $2
     br $for-loop|0
    end
   end
  end
 )
 (func $src/wasm/function-api/getPointCount (param $0 i32) (result i32)
  local.get $0
  i32.const 0
  i32.ge_s
  if (result i32)
   local.get $0
   global.get $src/wasm/function-api/engines
   i32.load offset=12
   i32.lt_s
  else
   i32.const 0
  end
  if
   global.get $src/wasm/function-api/engines
   local.get $0
   call $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get
   i32.load offset=4
   return
  end
  i32.const 0
 )
 (func $src/wasm/function-api/getPointRange (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 f64)
  (local $5 i32)
  (local $6 i32)
  local.get $0
  i32.const 0
  i32.ge_s
  if (result i32)
   local.get $0
   global.get $src/wasm/function-api/engines
   i32.load offset=12
   i32.lt_s
  else
   i32.const 0
  end
  if
   global.get $src/wasm/function-api/engines
   local.get $0
   call $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get
   local.set $0
   local.get $2
   i32.const 2
   i32.shl
   call $~lib/typedarray/Float32Array#constructor
   local.set $5
   local.get $2
   f64.convert_i32_s
   local.get $0
   i32.load offset=4
   local.get $1
   i32.sub
   f64.convert_i32_s
   f64.min
   local.set $4
   loop $for-loop|0
    local.get $3
    f64.convert_i32_s
    local.get $4
    f64.lt
    if
     local.get $5
     local.get $3
     i32.const 2
     i32.shl
     local.tee $2
     local.get $0
     i32.load
     local.get $1
     local.get $3
     i32.add
     i32.const 2
     i32.shl
     local.tee $6
     call $~lib/typedarray/Float32Array#__get
     call $~lib/typedarray/Float32Array#__set
     local.get $5
     local.get $2
     i32.const 1
     i32.add
     local.get $0
     i32.load
     local.get $6
     i32.const 1
     i32.add
     call $~lib/typedarray/Float32Array#__get
     call $~lib/typedarray/Float32Array#__set
     local.get $5
     local.get $2
     i32.const 2
     i32.add
     local.get $0
     i32.load
     local.get $6
     i32.const 2
     i32.add
     call $~lib/typedarray/Float32Array#__get
     call $~lib/typedarray/Float32Array#__set
     local.get $5
     local.get $2
     i32.const 3
     i32.add
     local.get $0
     i32.load
     local.get $6
     i32.const 3
     i32.add
     call $~lib/typedarray/Float32Array#__get
     call $~lib/typedarray/Float32Array#__set
     local.get $3
     i32.const 1
     i32.add
     local.set $3
     br $for-loop|0
    end
   end
   local.get $5
   return
  end
  i32.const 0
  call $~lib/typedarray/Float32Array#constructor
 )
 (func $src/wasm/function-api/getAllPoints (param $0 i32) (result i32)
  local.get $0
  i32.const 0
  i32.ge_s
  if (result i32)
   local.get $0
   global.get $src/wasm/function-api/engines
   i32.load offset=12
   i32.lt_s
  else
   i32.const 0
  end
  if
   global.get $src/wasm/function-api/engines
   local.get $0
   call $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get
   i32.load
   return
  end
  i32.const 0
  call $~lib/typedarray/Float32Array#constructor
 )
 (func $src/wasm/function-api/getStatistics (param $0 i32) (result i32)
  (local $1 i32)
  local.get $0
  i32.const 0
  i32.ge_s
  if (result i32)
   local.get $0
   global.get $src/wasm/function-api/engines
   i32.load offset=12
   i32.lt_s
  else
   i32.const 0
  end
  if
   global.get $src/wasm/function-api/engines
   local.get $0
   call $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get
   local.set $1
   i32.const 7
   call $~lib/typedarray/Float32Array#constructor
   local.tee $0
   i32.const 0
   local.get $1
   i32.load offset=36
   f32.convert_i32_s
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 1
   local.get $1
   i32.load offset=32
   f32.convert_i32_s
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 2
   local.get $1
   i32.load offset=4
   f32.convert_i32_s
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 3
   local.get $1
   f32.load offset=16
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 4
   local.get $1
   f32.load offset=20
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 5
   local.get $1
   f32.load offset=24
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   i32.const 6
   local.get $1
   i32.load offset=28
   f32.convert_i32_s
   call $~lib/typedarray/Float32Array#__set
   local.get $0
   return
  end
  i32.const 0
  call $~lib/typedarray/Float32Array#constructor
 )
 (func $src/wasm/attractor-engine/AttractorPoint#set:x (param $0 i32) (param $1 f32)
  local.get $0
  local.get $1
  f32.store
 )
 (func $src/wasm/attractor-engine/AttractorPoint#set:y (param $0 i32) (param $1 f32)
  local.get $0
  local.get $1
  f32.store offset=4
 )
 (func $src/wasm/attractor-engine/AttractorPoint#set:z (param $0 i32) (param $1 f32)
  local.get $0
  local.get $1
  f32.store offset=8
 )
 (func $src/wasm/function-api/getCurrentState (param $0 i32) (result i32)
  (local $1 f32)
  (local $2 f32)
  (local $3 f32)
  (local $4 i32)
  local.get $0
  i32.const 0
  i32.ge_s
  if (result i32)
   local.get $0
   global.get $src/wasm/function-api/engines
   i32.load offset=12
   i32.lt_s
  else
   i32.const 0
  end
  if
   global.get $src/wasm/function-api/engines
   local.get $0
   call $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get
   local.tee $0
   f32.load offset=16
   local.set $1
   local.get $0
   f32.load offset=20
   local.set $2
   local.get $0
   f32.load offset=24
   local.set $3
   local.get $0
   i32.load offset=28
   local.set $4
   i32.const 16
   i32.const 9
   call $~lib/rt/stub/__new
   local.tee $0
   f32.const 0
   call $src/wasm/attractor-engine/AttractorPoint#set:x
   local.get $0
   f32.const 0
   call $src/wasm/attractor-engine/AttractorPoint#set:y
   local.get $0
   f32.const 0
   call $src/wasm/attractor-engine/AttractorPoint#set:z
   local.get $0
   i32.const 0
   call $~lib/rt/common/OBJECT#set:rtId
   local.get $0
   local.get $1
   call $src/wasm/attractor-engine/AttractorPoint#set:x
   local.get $0
   local.get $2
   call $src/wasm/attractor-engine/AttractorPoint#set:y
   local.get $0
   local.get $3
   call $src/wasm/attractor-engine/AttractorPoint#set:z
   local.get $0
   local.get $4
   call $~lib/rt/common/OBJECT#set:rtId
   i32.const 4
   call $~lib/typedarray/Float32Array#constructor
   local.tee $4
   i32.const 0
   local.get $0
   f32.load
   call $~lib/typedarray/Float32Array#__set
   local.get $4
   i32.const 1
   local.get $0
   f32.load offset=4
   call $~lib/typedarray/Float32Array#__set
   local.get $4
   i32.const 2
   local.get $0
   f32.load offset=8
   call $~lib/typedarray/Float32Array#__set
   local.get $4
   i32.const 3
   local.get $0
   i32.load offset=12
   f32.convert_i32_s
   call $~lib/typedarray/Float32Array#__set
   local.get $4
   return
  end
  i32.const 0
  call $~lib/typedarray/Float32Array#constructor
 )
 (func $src/wasm/function-api/updateConfig (param $0 i32) (param $1 i32) (param $2 f32) (param $3 f32) (param $4 f32) (param $5 f32) (param $6 f32) (param $7 f32) (param $8 i32) (param $9 f32) (param $10 f32) (param $11 f32) (param $12 f32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  local.get $0
  i32.const 0
  i32.ge_s
  if (result i32)
   local.get $0
   global.get $src/wasm/function-api/engines
   i32.load offset=12
   i32.lt_s
  else
   i32.const 0
  end
  if
   i32.const 3
   call $~lib/typedarray/Float32Array#constructor
   local.tee $14
   i32.const 0
   local.get $2
   call $~lib/typedarray/Float32Array#__set
   local.get $14
   i32.const 1
   local.get $3
   call $~lib/typedarray/Float32Array#__set
   local.get $14
   i32.const 2
   local.get $4
   call $~lib/typedarray/Float32Array#__set
   i32.const 3
   call $~lib/typedarray/Float32Array#constructor
   local.tee $15
   i32.const 0
   local.get $5
   call $~lib/typedarray/Float32Array#__set
   local.get $15
   i32.const 1
   local.get $6
   call $~lib/typedarray/Float32Array#__set
   local.get $15
   i32.const 2
   local.get $7
   call $~lib/typedarray/Float32Array#__set
   i32.const 4
   call $~lib/typedarray/Float32Array#constructor
   local.tee $13
   i32.const 0
   local.get $9
   call $~lib/typedarray/Float32Array#__set
   local.get $13
   i32.const 1
   local.get $10
   call $~lib/typedarray/Float32Array#__set
   local.get $13
   i32.const 2
   local.get $11
   call $~lib/typedarray/Float32Array#__set
   local.get $13
   i32.const 3
   local.get $12
   call $~lib/typedarray/Float32Array#__set
   local.get $1
   local.get $14
   local.get $15
   local.get $8
   local.get $13
   call $src/wasm/attractor-engine/AttractorConfig#constructor
   local.set $1
   global.get $src/wasm/function-api/engines
   local.get $0
   call $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get
   local.tee $0
   local.get $1
   call $~lib/rt/common/OBJECT#set:rtId
   local.get $0
   i32.load offset=8
   local.get $1
   i32.load
   call $src/wasm/deterministic-random/DeterministicRandom#setSeed
  end
 )
 (func $src/wasm/function-api/resetEngine (param $0 i32)
  local.get $0
  i32.const 0
  i32.ge_s
  if (result i32)
   local.get $0
   global.get $src/wasm/function-api/engines
   i32.load offset=12
   i32.lt_s
  else
   i32.const 0
  end
  if
   global.get $src/wasm/function-api/engines
   local.get $0
   call $~lib/array/Array<src/wasm/attractor-engine/AttractorEngine>#__get
   local.tee $0
   i32.const 0
   call $~lib/rt/common/OBJECT#set:gcInfo
   local.get $0
   i32.const 0
   call $src/wasm/attractor-engine/AttractorEngine#set:sideFlipCount
   local.get $0
   i32.const 0
   call $src/wasm/attractor-engine/AttractorEngine#set:totalSteps
   local.get $0
   local.get $0
   i32.load offset=12
   i32.load offset=8
   i32.const 0
   call $~lib/typedarray/Float32Array#__get
   call $src/wasm/attractor-engine/AttractorEngine#set:currentX
   local.get $0
   local.get $0
   i32.load offset=12
   i32.load offset=8
   i32.const 1
   call $~lib/typedarray/Float32Array#__get
   call $src/wasm/attractor-engine/AttractorEngine#set:currentY
   local.get $0
   local.get $0
   i32.load offset=12
   i32.load offset=8
   i32.const 2
   call $~lib/typedarray/Float32Array#__get
   call $src/wasm/attractor-engine/AttractorEngine#set:currentZ
   local.get $0
   i32.const 1
   call $src/wasm/attractor-engine/AttractorEngine#set:currentSide
   local.get $0
   i32.load offset=8
   local.get $0
   i32.load offset=12
   i32.load
   call $src/wasm/deterministic-random/DeterministicRandom#setSeed
  end
 )
 (func $src/wasm/function-api/getEngineCount (result i32)
  global.get $src/wasm/function-api/engines
  i32.load offset=12
 )
 (func $src/wasm/function-api/clearAllEngines
  (local $0 i32)
  (local $1 i32)
  i32.const 0
  i32.const 1
  call $~lib/rt/stub/__new
  local.tee $1
  i32.const 1680
  i32.const 0
  memory.copy
  i32.const 16
  i32.const 8
  call $~lib/rt/stub/__new
  local.tee $0
  local.get $1
  i32.store
  local.get $0
  local.get $1
  i32.store offset=4
  local.get $0
  i32.const 0
  i32.store offset=8
  local.get $0
  i32.const 0
  i32.store offset=12
  local.get $0
  global.set $src/wasm/function-api/engines
  i32.const 0
  global.set $src/wasm/function-api/nextEngineId
 )
 (func $~lib/rt/stub/__pin (param $0 i32) (result i32)
  local.get $0
 )
 (func $~lib/rt/stub/__unpin (param $0 i32)
 )
 (func $~lib/rt/stub/__collect
 )
 (func $~start
  i32.const 1756
  global.set $~lib/rt/stub/offset
 )
)
