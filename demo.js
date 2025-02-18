function addScript( src, callback ) {
    var s = document.createElement( 'script' );
    s.setAttribute( 'src', src );
    s.onload=callback;
    document.body.appendChild( s );
  }
  const yukaLoadedProm = new Promise((resolve) => {
      // addScript('https://cdn.jsdelivr.net/npm/yuka@0.7.8/build/yuka.min.js', resolve)
      addScript('https://cdn.jsdelivr.net/npm/yuka@0.7.8/build/yuka.js', resolve)
  })
  const { Color3, MeshBuilder, Quaternion, StandardMaterial,  Vector3, } = BABYLON
  
  let entityManager, time, vehicle, target, pathHelper;
  window.greenDot = null
  window.redDot = null
  
  let scene
  const createScene = async () => {
      await yukaLoadedProm
      const loader = new YUKA.NavMeshLoader()
      const trunkUrl = 'https://colossus-asdkjfhasldkfhsdlkj.s3.amazonaws.com/scratchwork/trunk/trunk.gltf'
  
      scene = new BABYLON.Scene(engine)
      scene.useRightHandedSystem = true
  
      /* visual helpers */
      const redMat = new StandardMaterial("red_mat", scene)
      redMat.diffuseColor = Color3.Red();
  
      const greenMat = new StandardMaterial("green_mat", scene)
      greenMat.diffuseColor = Color3.Green();
  
  
      /* DISPLAY ACTUAL PICKED POINT */
      const createRedDot = (vec, diameter = 0.15) => {
          if (window.redDot) {
              window.redDot.position.copyFrom(vec)
              return
          }
          const dot = MeshBuilder.CreateSphere('expected', {
          diameter, }, scene)
          dot.material = redMat
          dot.position.copyFrom(vec)
          window.redDot = dot
          return dot
      }
      window.createRedDot = createRedDot
  
      /* DISPLAY NEAREST USED YUKA NODE */
      const createGreenDot = (vec, diameter = 0.15) => {
          if (window.greenDot) {
              window.greenDot.position.copyFrom(vec)
              return
          }
          const dot = MeshBuilder.CreateSphere('expected', {
          diameter, }, scene)
          dot.material = greenMat
          dot.position.copyFrom(vec)
          window.greenDot = dot
  
          return dot
      }
      window.createGreenDot = createGreenDot
      
      window.startPoint = new YUKA.Vector3(0.39083977540334064,
          0.007514377435048421, 1.1938051382700603
      )
  
      /* SETUP ALL THE YUKA */
      await loader.load(trunkUrl).then((navMesh) => {
  
          console.log('done creating navmesh: ', navMesh)
          window.navMesh = navMesh
  
          window.graphHelper = createGraphHelper(scene, navMesh.graph, 0.03)
          window.convexRegionHelper = createConvexRegionHelper(navMesh, scene)
  
          const centroid = navMesh.getClosestRegion(startPoint).centroid
          const fromVec = new YUKA.Vector3(centroid.x, centroid.y, centroid.z)
          window.fromVec = fromVec
  
          // YUKA specific
          target = new YUKA.Vector3()
  
          entityManager = new YUKA.EntityManager()
          time = new YUKA.Time()
  
          vehicleMesh = createVehicle(scene, { size: 0.5, y: 0.5 })
          vehicle = new YUKA.Vehicle()
          vehicle.maxSpeed = 1.5
          vehicle.maxForce = 10
          vehicle.setRenderComponent(vehicleMesh, sync)
          vehicle.position = fromVec
  
          const followPathBehavior = new YUKA.FollowPathBehavior()
          followPathBehavior.active = false
          vehicle.steering.add(followPathBehavior)
  
          /**** Set camera  *****/
          const camera = new BABYLON.ArcRotateCamera(
              "camera", -Math.PI / 2, Math.PI / 2.5, 10, new BABYLON.Vector3(0, 0, 0)
          );
          camera.attachControl(canvas, true);
  
          entityManager.add(vehicle)
          animate()
  
          connectNodes(21, 77)
          
          connectNodes(12, 251)
          connectNodes(332, 286)
          // connectNodes(288, 317)
          connectNodes(317, 288)
  
          connectNodes(34, 327)
  
          connectNodes(30, 531)
          connectNodes(23, 178)
  
          connectNodes(14, 217)
  
          connectNodes(6, 141)
  
          connectNodes(31, 385)
  
          connectNodes(0, 499)
  
          connectNodes(5, 458)
      })
  
      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
  
      const fromVec = new YUKA.Vector3(startPoint.x, startPoint.y, startPoint.z)
      window.fromVec = fromVec
  
      scene.onPointerObservable.add((pointerInfo) => {
          switch (pointerInfo.type) {
              case BABYLON.PointerEventTypes.POINTERDOWN:
   
              const pickInfo = pointerInfo.pickInfo
  
              if (pickInfo) {
                  const pickedPoint = pickInfo.pickedPoint
                  if (window.logPickedPoint || true) {
                      console.log('pickedPoint: ', pickedPoint)
                  }
                  window.pickedPoint = pickedPoint
  
                  if (pickInfo.pickedMesh) {
                      const pMesh = pickInfo.pickedMesh
                      if (window.logPickedMesh) {
                          console.log('pickedMesh: ', pMesh)
                      }
                      if (pMesh._yuka_region) {
                          console.log('\nYUKA REGION: ', pMesh._yuka_region)
                      }
                      if (pMesh._yuka_node) {
                          console.log('\nYUKA NODE: ', pMesh._yuka_node)
                      }
                  }
              }
              break;
  
              case BABYLON.PointerEventTypes.POINTERUP:
                  if (!pickedPoint) return
                  try {
                      const point = new YUKA.Vector3(pickedPoint.x, pickedPoint.y, pickedPoint.z)
                      const centroid = navMesh.getClosestRegion(point).centroid
                      const toVec = new YUKA.Vector3(centroid.x, centroid.y, centroid.z)
  
                      target = toVec
                      findPathTo(target)
  
                      const nearestRegion = navMesh.getClosestRegion(target)
                      // console.log('nearestRegion: ', nearestRegion.centroid)
                      const nearestNodeIndex = navMesh.getNodeIndex(nearestRegion)
                      console.log('nearest node\'s index: ', nearestNodeIndex)
                      createRedDot(pickedPoint)
                      const usedPoint = navMesh.graph._nodes.get(nearestNodeIndex)?.position
                      if (!usedPoint) return
                      createGreenDot(new Vector3(usedPoint.x, usedPoint.y, usedPoint.z))
  
                  } catch(err) {
                      console.error(err)
                  }
                  break;
              case BABYLON.PointerEventTypes.POINTERPICK:
              break;
          }
      });
  
      /* DISPLAY ACTUAL MESH MODEL */
      BABYLON.SceneLoader.ImportMesh("", trunkUrl, "", scene, async (trunkMeshes) => {
          window.trunkMeshes = trunkMeshes
          // const sqrt2 = Math.sqrt(2)
          // trunkMeshes[0].rotationQuaternion = new Quaternion(1/sqrt2, 0, 0, 1/sqrt2)
          // trunkMeshes[0].rotationQuaternion = new Quaternion(0, 0, 0, 0)
          trunkMeshes[1].rotationQuaternion = new Quaternion(0, 0, 0, 0)
  
      });
  
      return scene;
  }
  
  
  
  function createGraphHelper(scene, graph, nodeSize = 1, nodeColor = '#4e84c4', edgeColor = '#ffffff') {
    const nodes = []
    graph.getNodes(nodes)
  
    const parent = new BABYLON.TransformNode('nodes-parent', scene)
    let nodeCount = 0
  
    for (let node of nodes) {
      const nodeMaterial = new BABYLON.StandardMaterial('node', scene)
      nodeMaterial.emmissiveColor = BABYLON.Color3.FromHexString(nodeColor)
  
      const nodeMesh = BABYLON.MeshBuilder.CreatePolyhedron(
        `node-${nodeCount}`,
        {
          type: 3, // Icosahedron
          size: nodeSize,
        },
        scene
      )
      nodeCount += 1
  
      nodeMesh.parent = parent
      nodeMesh.material = nodeMaterial
      nodeMesh.position = new BABYLON.Vector3(node.position.x, node.position.y, node.position.z)
      nodeMesh._yuka_node = node
  
      // edges
      const edges = []
      const lines = []
      for (let node of nodes) {
        graph.getEdgesOfNode(node.index, edges)
        node.edges = edges.slice()
  
        const positions = []
        
        for (let edge of edges) {
          const fromNode = graph.getNode(edge.from)
          const toNode = graph.getNode(edge.to)
  
          positions.push(new BABYLON.Vector3(fromNode.position.x, fromNode.position.y, fromNode.position.z))
          positions.push(new BABYLON.Vector3(toNode.position.x, toNode.position.y, toNode.position.z))
        }
  
        lines.push(positions)
      }
  
      const pathHelper = BABYLON.MeshBuilder.CreateLineSystem(
        'path-helper',
        {
          lines,
          updatable: false,
        },
        scene
      )
      pathHelper.color = BABYLON.Color3.Green()
      pathHelper.parent = parent
      pathHelper.isPickable = false
    }
  
    return parent
  }
  
  function createConvexRegionHelper(navMesh, scene) {
    const regions = navMesh.regions
  
    const convexRootMesh = new BABYLON.Mesh('root', scene)
    const customMeshMaterial = new BABYLON.StandardMaterial('convex-root', scene)
    customMeshMaterial.emmissiveColor = BABYLON.Color3.Random()
  
    convexRootMesh.material = customMeshMaterial
  
    let regionCount = 0
  
    for (let region of regions) {
      // console.log('region: ', region, regionCount)
      const customMesh = new BABYLON.Mesh(`convex-region-${regionCount}`, scene)
      regionCount += 1
      customMesh._yuka_region = region
      
      const positions = []
      const colors = []
      const indices = []
  
      // one color for each convex region
      const color = BABYLON.Color3.Random()
  
      // count edges
  
      let edge = region.edge
      const edges = []
  
      do {
        edges.push(edge)
        edge = edge.next
      } while (edge !== region.edge)
  
      // triangulate
      region.edges = edges
      const triangleCount = edges.length - 2
  
      for (let i = 1, l = triangleCount; i <= l; i++) {
        const v1 = edges[0].vertex
        const v2 = edges[i + 0].vertex
        const v3 = edges[i + 1].vertex
  
        positions.push(v1.x, v1.y, v1.z)
        positions.push(v2.x, v2.y, v2.z)
        positions.push(v3.x, v3.y, v3.z)
  
        colors.push(color.r, color.g, color.b, 1)
        colors.push(color.r, color.g, color.b, 1)
        colors.push(color.r, color.g, color.b, 1)
      }
  
      for (let i = 0; i < positions.length / 3; i++) {
          indices.push(i)
      }
  
      const normals = []
  
      const vertexData = new BABYLON.VertexData()
      BABYLON.VertexData.ComputeNormals(positions, indices, normals)
  
      vertexData.positions = positions
      vertexData.indices = indices
      vertexData.normals = normals
      vertexData.colors = colors
  
      vertexData.applyToMesh(customMesh)
  
      var mat = new BABYLON.StandardMaterial('mat', scene)
      mat.backFaceCulling = false
      customMesh.material = mat
  
      customMesh.parent = convexRootMesh
      customMesh.setEnabled(false)
    }
  
    return convexRootMesh
  }
  
  function connectNodes(nodeAIndex, nodeBIndex) {
      const nodeA = navMesh.graph._nodes.get(nodeAIndex)
      const nodeB = navMesh.graph._nodes.get(nodeBIndex)
  
      const p1 = nodeA.position
      const p2 = nodeB.position
      const distance = Math.sqrt(p2.sub(p1).squaredLength())
      const x = (p1.x + p2.x) * 0.5
      const y = (p1.y + p2.y) * 0.5
      const z = (p1.z + p2.z) * 0.5
      const position = new YUKA.Vector3(x, y, z)
  
      const edgesA = navMesh.graph._edges.get(nodeA.index)
      const edgesB = navMesh.graph._edges.get(nodeB.index)
  
      let edge = new YUKA.NavEdge(nodeA.index, nodeB.index, distance)
      edgesA.push(edge)
      edgesB.push(edge)
      /* other way */
      edge = new YUKA.NavEdge(nodeB.index, nodeA.index, distance)
      edgesA.push(edge)
      edgesB.push(edge)
  
  
      const r1 = navMesh.regions[nodeAIndex]
      const e1First = r1.edges[0]
      const e1Last = r1.edges[r1.edges.length - 1]
  
      const r2 = navMesh.regions[nodeBIndex]
      const e2First = r2.edges[0]
      const e2Last = r2.edges[r2.edges.length - 1]
  
      const halfEdge1 = new YUKA.HalfEdge(position)
      const halfEdge2 = new YUKA.HalfEdge(position)
  
      /*  r1 -> r2 */
      halfEdge1.prev = e1Last
      e1Last.next = halfEdge1
      halfEdge1.next = e2First
      e2First.prev = halfEdge1
  
      halfEdge2.prev = e2Last
      e2Last.next = halfEdge2
      halfEdge2.next = e1First
      e1First.prev = halfEdge2
  
  
      halfEdge1.twin = halfEdge2
      halfEdge2.twin = halfEdge1
  
      halfEdge1.polygon = r1
      halfEdge2.polygon = r2
  }
  window.connectNodes = connectNodes
  
  
  const VehicleTypes = {
    default: 0,
    cone: 1,
    box: 2,
    // etc
  }
  
  /*
  options: {
    type: VehicleTypes
    name: string
    size: number
    x: number
    y: number
    z: number
  }
  */
  const createVehicle = (scene, options) => {
    const vehicleType = options?.type ?? VehicleTypes.default
    const size = options?.size ?? 1
    const height = 1 * size
    const diameterBottom = 0.5 * size
    const diameterTop = 0
    const name = options?.name ?? 'vehicle'
  
    if (vehicleType === VehicleTypes.default) {
      const vehicleMesh = BABYLON.MeshBuilder.CreateCylinder('cone', { height, diameterTop, diameterBottom }, scene)
      vehicleMesh.rotation.x = Math.PI * 0.5
  
      const dodecahedron2 = BABYLON.MeshBuilder.CreatePolyhedron('dodecahedron', {
        type: 1,
        size: 0.22 * size,
      })
      dodecahedron2.position.z -= 0.1
  
      const newVehicleMesh = BABYLON.Mesh.MergeMeshes([vehicleMesh, dodecahedron2], true)
      newVehicleMesh.name = name
      newVehicleMesh.position.y = options?.y ?? 0
      newVehicleMesh.bakeCurrentTransformIntoVertices()
  
      return newVehicleMesh
    } else if (vehicleType === VehicleTypes.cone) {
      const vehicleMesh = BABYLON.MeshBuilder.CreateCylinder(name, { height, diameterTop, diameterBottom }, scene)
  
      vehicleMesh.position.y = options?.y ?? 0
      vehicleMesh.rotation.x = Math.PI * 0.5
      vehicleMesh.bakeCurrentTransformIntoVertices()
  
      return vehicleMesh
    } else if (vehicleType === VehicleTypes.box) {
      //
    }
  }
  
  
  function onWindowResize() {
    engine.resize()
  }
  
  function animate() {
    requestAnimationFrame(animate)
  
    const delta = time.update().getDelta()
    entityManager.update(delta)
  
    scene.render()
  }
  
  
  function findPathTo(target) {
    const from = vehicle.position
    const to = target
  
    const path = navMesh.findPath(from, to)
    console.warn(path)
  
    if (path.length === 0) {
      console.error('NO PATH!')
      return
    }
  
    if (pathHelper) {
      pathHelper.dispose()
    }
  
    pathHelper = BABYLON.MeshBuilder.CreateLines(
      'path-helper',
      {
        points: path,
        updatable: false,
      },
      scene
    )
    pathHelper.color = BABYLON.Color3.Red()
  
    const followPathBehavior = vehicle.steering.behaviors[0]
    followPathBehavior.active = true
    followPathBehavior.path.clear()
  
    for (const point of path) {
      followPathBehavior.path.add(point)
    }
  }
  
  function sync(entity, renderComponent) {
    BABYLON.Matrix.FromValues(...entity.worldMatrix.elements).decomposeToTransformNode(renderComponent)
  }
  
  
  