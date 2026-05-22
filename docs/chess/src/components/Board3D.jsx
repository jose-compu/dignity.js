import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const LIGHT_WOOD = 0xc9a66b;
const DARK_WOOD = 0x6b4423;
const FRAME_WOOD = 0x4a2f16;
const WHITE_PIECE = 0xf5f0e6;
const BLACK_PIECE = 0x1a1410;

function squareName(file, rank) {
  return `${String.fromCharCode(97 + file)}${rank + 1}`;
}

function parseSquare(name) {
  return {
    file: name.charCodeAt(0) - 97,
    rank: Number(name[1]) - 1
  };
}

function boardPosition(file, rank) {
  return {
    x: file - 3.5,
    y: 0.35,
    z: rank - 3.5
  };
}

function createPieceMesh(type, color, materialBase) {
  const group = new THREE.Group();
  const material = materialBase.clone();
  material.color.setHex(color);

  if (type === 'p') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.18, 24), material);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.55, 24), material);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), material);
    base.position.y = 0.09;
    body.position.y = 0.45;
    head.position.y = 0.82;
    group.add(base, body, head);
  } else if (type === 'r') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.22, 24), material);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.55, 0.52), material);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.62), material);
    base.position.y = 0.11;
    tower.position.y = 0.5;
    top.position.y = 0.86;
    group.add(base, tower, top);
  } else if (type === 'n') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.2, 24), material);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.55, 16), material);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), material);
    neck.rotation.z = 0.45;
    neck.position.set(0.08, 0.58, 0);
    head.position.set(0.22, 0.86, 0);
    base.position.y = 0.1;
    group.add(base, neck, head);
  } else if (type === 'b') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.2, 24), material);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.28, 0.72, 24), material);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), material);
    base.position.y = 0.1;
    body.position.y = 0.56;
    head.position.y = 0.98;
    group.add(base, body, head);
  } else if (type === 'q') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.22, 24), material);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.72, 24), material);
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 12, 24), material);
    base.position.y = 0.11;
    body.position.y = 0.58;
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 1.02;
    group.add(base, body, crown);
  } else {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.24, 24), material);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 0.78, 24), material);
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.12), material);
    const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.12), material);
    base.position.y = 0.12;
    body.position.y = 0.62;
    crossBar.position.y = 1.02;
    crossVert.position.y = 1.12;
    group.add(base, body, crossBar, crossVert);
  }

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

function buildBoard(scene) {
  const boardGroup = new THREE.Group();

  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const isLight = (file + rank) % 2 === 0;
      const square = new THREE.Mesh(
        new THREE.BoxGeometry(0.98, 0.16, 0.98),
        new THREE.MeshStandardMaterial({
          color: isLight ? LIGHT_WOOD : DARK_WOOD,
          roughness: 0.78,
          metalness: 0.04
        })
      );
      square.position.set(file - 3.5, 0.08, rank - 3.5);
      square.receiveShadow = true;
      square.userData.square = squareName(file, rank);
      boardGroup.add(square);
    }
  }

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(9.4, 0.28, 9.4),
    new THREE.MeshStandardMaterial({ color: FRAME_WOOD, roughness: 0.85, metalness: 0.02 })
  );
  frame.position.y = -0.08;
  frame.receiveShadow = true;
  boardGroup.add(frame);

  scene.add(boardGroup);
  return boardGroup;
}

function syncPieces(pieceGroup, fen, selectedSquare, highlightSquares, pieceMeshesRef) {
  while (pieceGroup.children.length) {
    pieceGroup.remove(pieceGroup.children[0]);
  }
  pieceMeshesRef.current = [];

  const [piecePlacement] = fen.split(' ');
  const rows = piecePlacement.split('/');
  const pieceMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.42,
    metalness: 0.18
  });

  rows.forEach((row, rowIndex) => {
    let file = 0;
    for (const char of row) {
      if (Number.isInteger(Number(char))) {
        file += Number(char);
      } else {
        const rank = 7 - rowIndex;
        const mesh = createPieceMesh(
          char.toLowerCase(),
          char === char.toUpperCase() ? WHITE_PIECE : BLACK_PIECE,
          pieceMaterial
        );
        const pos = boardPosition(file, rank);
        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.userData.square = squareName(file, rank);
        pieceGroup.add(mesh);
        pieceMeshesRef.current.push(mesh);
        file += 1;
      }
    }
  });

  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0x5b7fff,
    transparent: true,
    opacity: 0.35
  });
  const targetMaterial = new THREE.MeshBasicMaterial({
    color: 0x7ee787,
    transparent: true,
    opacity: 0.38
  });

  if (selectedSquare) {
    const { file, rank } = parseSquare(selectedSquare);
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32), markerMaterial);
    const pos = boardPosition(file, rank);
    marker.position.set(pos.x, 0.22, pos.z);
    pieceGroup.add(marker);
  }

  highlightSquares.forEach((square) => {
    const { file, rank } = parseSquare(square);
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 32), targetMaterial);
    const pos = boardPosition(file, rank);
    marker.position.set(pos.x, 0.21, pos.z);
    pieceGroup.add(marker);
  });
}

function squareFromHit(object) {
  let current = object;
  while (current) {
    if (current.userData?.square) {
      return current.userData.square;
    }
    current = current.parent;
  }
  return null;
}

export default function Board3D({
  fen,
  selectedSquare,
  legalTargets,
  onSquareClick,
  orientation = 'w',
  interactive = false
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const pieceGroupRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const squaresRef = useRef([]);
  const pieceMeshesRef = useRef([]);
  const clickHandlerRef = useRef(onSquareClick);
  const interactiveRef = useRef(interactive);

  useEffect(() => {
    clickHandlerRef.current = onSquareClick;
  }, [onSquareClick]);

  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x120d0a);
    scene.fog = new THREE.Fog(0x120d0a, 14, 28);

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(orientation === 'w' ? 0 : 0, 8.5, orientation === 'w' ? 8.5 : -8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 6;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 0.2, 0);
    controls.enableRotate = true;

    scene.add(new THREE.AmbientLight(0xfff1dd, 0.45));
    const keyLight = new THREE.DirectionalLight(0xffe7c4, 1.15);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fill = new THREE.PointLight(0x8ec5ff, 0.35, 30);
    fill.position.set(-5, 6, -4);
    scene.add(fill);

    const boardGroup = buildBoard(scene);
    squaresRef.current = boardGroup.children.filter((child) => child.userData.square);

    const pieceGroup = new THREE.Group();
    scene.add(pieceGroup);
    pieceGroupRef.current = pieceGroup;
    sceneRef.current = scene;

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) {
        return;
      }
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleResize)
      : null;
    resizeObserver?.observe(mount);

    let pointerDown = null;

    const pickSquare = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      const targets = [...squaresRef.current, ...pieceMeshesRef.current];
      const hits = raycasterRef.current.intersectObjects(targets, true);
      for (const hit of hits) {
        const square = squareFromHit(hit.object);
        if (square) {
          return square;
        }
      }
      return null;
    };

    const handlePointerDown = (event) => {
      pointerDown = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event) => {
      if (!interactiveRef.current || !pointerDown) {
        pointerDown = null;
        return;
      }

      const dx = event.clientX - pointerDown.x;
      const dy = event.clientY - pointerDown.y;
      pointerDown = null;

      if ((dx * dx) + (dy * dy) > 36) {
        return;
      }

      const square = pickSquare(event.clientX, event.clientY);
      if (square) {
        clickHandlerRef.current?.(square);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [orientation]);

  useEffect(() => {
    if (pieceGroupRef.current) {
      syncPieces(pieceGroupRef.current, fen, selectedSquare, legalTargets, pieceMeshesRef);
    }
  }, [fen, selectedSquare, legalTargets]);

  return (
    <div className={`board-3d${interactive ? ' board-3d--interactive' : ''}`} ref={mountRef}>
      {interactive ? <p className="board-3d__hint">Click pieces or squares to move</p> : null}
    </div>
  );
}
