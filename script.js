// --- Selección de Elementos del DOM ---
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const roomImage = document.getElementById('room-image');
const roomElement = document.getElementById('room'); // Div que contiene la imagen
const roomMessage = document.getElementById('room-message');
const actionMessage = document.getElementById('action-message');
const inventoryList = document.getElementById('inventory-list');
const jumpscareElement = document.getElementById('jumpscare');
const jumpscareImage = document.getElementById('jumpscare-image');
const muteButton = document.getElementById('mute-button');
// --- NUEVA REFERENCIA PARA EL TEMPORIZADOR ---
const timerDisplay = document.getElementById('timer-display');

// --- Elementos de Audio ---
const bgmSuspense = document.getElementById('bgm-suspense');
const bgmCreepy = document.getElementById('bgm-creepy');
const sfxJumpScare1 = document.getElementById('sfx-jumpscare1');
const sfxDoorCreak = document.getElementById('sfx-door-creak');
const sfxItemPickup = document.getElementById('sfx-item-pickup');
const sfxUnlock = document.getElementById('sfx-unlock');
const sfxLocked = document.getElementById('sfx-locked');
const sfxWhisper = document.getElementById('sfx-whisper');
const sfxBang = document.getElementById('sfx-bang');
// Añade más SFX aquí...

// --- Variables de Estado del Juego ---
let currentRoom = null;
let inventory = [];
let isMuted = false;
let currentBGM = null;
// --- NUEVAS VARIABLES PARA EL TEMPORIZADOR ---
let timerInterval = null; // Para guardar el ID del intervalo y poder detenerlo
const initialTime = 10 * 60; // Tiempo inicial en segundos (10 minutos)
let remainingTime = initialTime; // Tiempo restante actual en segundos

// --- Definición de las Salas y Objetos ---
// Mantenemos tus coordenadas y lógica de salas/objetos
const rooms = {
    // --- SALA 1: EL SÓTANO ---
    sotano: {
        image: 'images/room1.jpeg',
        message: 'Estás en un sótano húmedo y oscuro. Huele a tierra mojada y... a algo más. Hay una puerta de madera al fondo.',
        backgroundMusic: bgmCreepy,
        objects: [
            { id: 'puerta_madera_sotano', name: 'Puerta de madera', coords: { top: '56%', left: '45%', width: '2%', height: '6%' },
                action: (state) => {
                    if (state.flags.sotano_puerta_abierta) {
                        playSound(sfxDoorCreak);
                        changeRoom('pasillo');
                    } else if (state.inventory.includes('key')) {
                         setMessage('La vieja cerradura cede con un chirrido. La puerta está abierta.');
                         playSound(sfxUnlock);
                         state.flags.sotano_puerta_abierta = true;
                    } else {
                         setMessage('La puerta está cerrada con llave. Necesitas encontrar cómo abrirla.');
                         playSound(sfxLocked);
                    }
                }
            },
            { id: 'caja_rota', name: 'Caja rota', coords: { top: '72%', left: '30%', width: '7%', height: '7%' },
                action: (state) => {
                    if (!state.flags.sotano_caja_revisada) {
                        setMessage('Remueves unos tablones sueltos y encuentras una vieja llave oxidada.');
                        playSound(sfxItemPickup);
                        addItem('key', 'images/key.png');
                        state.flags.sotano_caja_revisada = true;
                    } else {
                        setMessage('Ya has revisado esta caja.');
                    }
                }
            },
             { id: 'tuberia_sotano', name: 'Tubería que gotea', coords: { top: '38%', left: '35%', width: '10%', height: '40%' },
                 action: (state) => {
                     setMessage('Una tubería vieja y oxidada gotea sin cesar. El sonido es inquietante.');
                     // ¡Susto potencial!
                     // V PROBABILIDAD CAMBIADA A 70% V
                     if (!state.flags.sotano_tuberia_susto && Math.random() < 0.7) { // 70% de probabilidad
                        // V DURACIÓN CAMBIADA A 2000 ms (2 segundos) V
                        triggerJumpScare('images/scare1.png', sfxJumpScare1, 2000); // Imagen, sonido, duración 2000 ms
                        playSound(sfxWhisper); // Un susurro después
                        state.flags.sotano_tuberia_susto = true; // Solo una vez
                     }
                 }
             }
        ],
        flags: {
            sotano_puerta_abierta: false,
            sotano_caja_revisada: false,
            sotano_tuberia_susto: false,
        }
    },
    // --- SALA 2: EL PASILLO ---
    pasillo: {
        image: 'images/room2.jpeg',
        message: 'Un pasillo largo y decrépito. Hay varias puertas y un viejo cuadro en la pared. El aire es pesado.',
        backgroundMusic: bgmSuspense,
        objects: [
            { id: 'puerta_biblioteca', name: 'Puerta a la Biblioteca', coords: { top: '55%', left: '69%', width: '2%', height: '5%' },
                action: (state) => {
                    if (state.flags.pasillo_codigo_resuelto) {
                        playSound(sfxDoorCreak);
                        changeRoom('biblioteca');
                    } else {
                        setMessage('Esta puerta tiene un extraño mecanismo con números. Parece necesitar un código de 3 dígitos.');
                        playSound(sfxLocked);
                        const code = prompt("Introduce el código (3 dígitos):");
                        if (code === '482') {
                             setMessage('El mecanismo hace clic y la puerta se desbloquea.');
                             playSound(sfxUnlock);
                             state.flags.pasillo_codigo_resuelto = true;
                        } else if (code) {
                             setMessage('El código es incorrecto. El mecanismo no se mueve.');
                             playSound(sfxLocked);
                             if(Math.random() < 0.4) { playSound(sfxBang); }
                        } else {
                             setActionMessage("No has introducido ningún código.");
                        }
                    }
                }
            },
            { id: 'cuadro_antiguo', name: 'Cuadro antiguo', coords: { top: '42%', left: '26%', width: '1%', height: '5%' },
                action: (state) => {
                     setMessage('Un retrato de aspecto severo. Los ojos parecen seguirte... En la esquina inferior derecha hay un número apenas visible: "8".');
                }
            },
            { id: 'reloj_parado', name: 'Reloj de pie parado', coords: { top: '41%', left: '42%', width: '2%', height: '4%' },
                action: (state) => {
                     setMessage('Un reloj de abuelo cubierto de polvo. Está parado. Las manecillas marcan las 4 y... ¿el número 2 está arañado?.');
                }
            },
            { id: 'puerta_vestibulo', name: 'Puerta al Vestíbulo Principal', coords: { top: '55%', left: '30%', width: '2%', height: '6%' },
                action: (state) => {
                    setMessage("Atraviesas la puerta hacia lo que parece ser el vestíbulo principal de la mansión.");
                    playSound(sfxDoorCreak);
                    changeRoom('vestibulo');
                }
            },
            { id: 'puerta_dormitorio', name: 'Puerta al Dormitorio', coords: { top: '60%', left: '80%', width: '2%', height: '6%' },
                action: (state) => {
                    if (rooms.dormitorio.flags.dormitorio_puerta_abierta) {
                        setMessage("La puerta al dormitorio se abre sin problemas.");
                        playSound(sfxDoorCreak);
                        changeRoom('dormitorio');
                    } else {
                        setMessage("La puerta parece atascada, pero consigues abrirla con un empujón. Chirría ominosamente al moverse.");
                        playSound(sfxLocked);
                        setTimeout(() => {
                           playSound(sfxDoorCreak);
                           changeRoom('dormitorio');
                        }, 300);
                    }
                }
            },
             { id: 'volver_sotano', name: 'Puerta al Sótano', coords: { top: '62%', left: '16%', width: '2%', height: '6%' },
                action: (state) => {
                    playSound(sfxDoorCreak);
                    changeRoom('sotano');
                }
             }
        ],
        flags: {
            pasillo_codigo_resuelto: false,
        }
    },
    // --- SALA 3: LA BIBLIOTECA ---
    biblioteca: {
        image: 'images/room3.jpeg',
        message: 'Una biblioteca llena de libros polvorientos. El silencio es casi total, roto solo por el crujir de la madera vieja.',
        backgroundMusic: bgmCreepy,
        objects: [
            { id: 'estanteria_libros', name: 'Estantería', coords: { top: '35%', left: '35%', width: '2%', height: '3%' },
                action: (state) => {
                    if (!state.inventory.includes('gear')) {
                        setMessage('Miles de libros. Uno parece fuera de lugar... ¡Ajá! Detrás de un tomo falso, encuentras un pequeño engranaje dorado.');
                        playSound(sfxItemPickup);
                        addItem('gear', 'images/gear.png');
                    } else {
                        setMessage('Ya has buscado bien en las estanterías.');
                    }
                }
            },
            { id: 'escritorio_biblio', name: 'Escritorio', coords: { top: '69%', left: '35%', width: '7%', height: '3%' },
                 action: (state) => {
                     if (!state.flags.biblioteca_nota_leida) {
                         setMessage('Sobre el escritorio hay una nota: "El guardián final requiere el metal del tiempo y el oro del saber..."');
                         state.flags.biblioteca_nota_leida = true;
                         playSound(sfxWhisper);
                     } else {
                          setMessage('Ya leíste la nota que había aquí.');
                     }
                 }
            },
             { id: 'puerta_pasillo_biblio', name: 'Puerta al Pasillo', coords: { top: '55%', left: '81%', width: '2%', height: '6%' },
                action: (state) => {
                    playSound(sfxDoorCreak);
                    changeRoom('pasillo');
                }
             }
        ],
         flags: {
             biblioteca_nota_leida: false,
         }
    },
    // --- SALA 4: EL DORMITORIO ---
    dormitorio: {
        image: 'images/room4.jpeg',
        message: 'Un dormitorio inquietante. Una vieja cama con dosel y una mecedora que se mueve sola lentamente...',
        backgroundMusic: bgmSuspense,
        objects: [
            { id: 'mecedora', name: 'Mecedora', coords: { top: '61%', left: '74%', width: '2%', height: '6%' },
                 action: (state) => {
                    setMessage('La mecedora cruje y se balancea sola. Te da escalofríos.');
                    if (!state.flags.dormitorio_mecedora_susto) {
                        setTimeout(() => {
                            playSound(sfxBang);
                            setMessage('¡La mecedora se detiene de golpe!');
                        }, 600);
                         state.flags.dormitorio_mecedora_susto = true;
                    }
                 }
            },
            { id: 'cama_dosel', name: 'Cama con dosel', coords: { top: '83%', left: '39%', width: '2%', height: '6%' },
                 action: (state) => {
                     if (!state.inventory.includes('crowbar')) {
                         setMessage('Buscas bajo la cama polvorienta y encuentras una palanca metálica fría al tacto.');
                         playSound(sfxItemPickup);
                         addItem('crowbar', 'images/crowbar.png');
                     } else {
                         setMessage('No parece haber nada más de interés en la cama.');
                     }
                 }
            },
            { id: 'puerta_pasillo_dorm', name: 'Puerta al Pasillo', coords: { top: '55%', left: '81%', width: '2%', height: '3%' },
                action: (state) => {
                    if (!state.flags.dormitorio_puerta_abierta && state.inventory.includes('crowbar')) {
                        setMessage('Usas la palanca para forzar la puerta atascada. ¡Se abre!');
                        playSound(sfxBang);
                        playSound(sfxDoorCreak);
                        state.flags.dormitorio_puerta_abierta = true;
                        changeRoom('pasillo'); // Salir tras usarla
                    }
                    else if (state.flags.dormitorio_puerta_abierta) {
                        playSound(sfxDoorCreak);
                        changeRoom('pasillo');
                    }
                    else {
                        setMessage('La puerta está bloqueada desde este lado. Parece necesitar algo para forzarla.');
                        playSound(sfxLocked);
                        // No te deja salir si no tienes la palanca
                    }
                }
            }
        ],
        flags: {
            dormitorio_mecedora_susto: false,
            dormitorio_puerta_abierta: false,
        }
    },
    // --- SALA 5: VESTÍBULO FINAL ---
    vestibulo: {
        image: 'images/room5.jpeg',
        message: 'El vestíbulo principal. La gran puerta de salida está frente a ti, pero tiene una cerradura compleja.',
        backgroundMusic: bgmSuspense,
        objects: [
            { id: 'puerta_salida', name: 'Puerta de Salida', coords: { top: '47%', left: '51%', width: '1%', height: '4%' },
                action: (state) => {
                    if (state.inventory.includes('crowbar') && state.inventory.includes('gear')) {
                        setMessage('Colocas el engranaje dorado en una ranura y usas la palanca metálica en un mecanismo. La cerradura hace un ruido sordo y ¡LA PUERTA SE ABRE! Has escapado... ¿o no?');
                        playSound(sfxUnlock);
                        endGame(true); // Victoria
                    } else if (state.inventory.includes('crowbar')) {
                        setMessage('Hay una ranura que parece necesitar algún tipo de engranaje dorado...');
                        playSound(sfxLocked);
                    } else if (state.inventory.includes('gear')) {
                         setMessage('Hay un mecanismo que parece necesitar una palanca resistente para activarlo...');
                         playSound(sfxLocked);
                    } else {
                        setMessage('La cerradura es compleja. La nota de la biblioteca mencionaba "el metal del tiempo y el oro del saber"... Necesitas los objetos correctos.');
                        playSound(sfxLocked);
                    }
                }
            },
            { id: 'volver_pasillo_vestibulo', name: 'Volver al Pasillo', coords: { top: '56%', left: '11%', width: '2%', height: '6%' },
                action: (state) => {
                     playSound(sfxDoorCreak);
                     changeRoom('pasillo');
                }
            }
        ],
        flags: {}
    },
};

// --- IMPORTANTE: Copia profunda inicial para resetear flags ---
// Se hace UNA VEZ al cargar el script.
const roomsDataForReset = JSON.parse(JSON.stringify(rooms));


// --- Funciones del Juego ---

/**
 * Actualiza el elemento HTML del temporizador con el tiempo restante formateado.
 * @param {number} seconds - El número total de segundos restantes.
 */
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;

    if (seconds <= 60 && seconds > 0) {
        timerDisplay.classList.add('low-time');
    } else {
        timerDisplay.classList.remove('low-time');
    }
    if (seconds <= 0) {
         timerDisplay.classList.remove('low-time');
         timerDisplay.style.color = '#b71c1c'; // Rojo oscuro al llegar a 0
    } else {
         // Restaura el color si no está en low-time ni en 0
         if (seconds > 60) timerDisplay.style.color = '#ffc107'; // Color normal
    }
}

/**
 * Inicia el contador del temporizador.
 */
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    remainingTime = initialTime;
    updateTimerDisplay(remainingTime); // Muestra tiempo inicial

    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay(remainingTime);

        if (remainingTime <= 0) {
            console.log("¡Tiempo agotado!");
            clearInterval(timerInterval);
            timerInterval = null;
            // Podrías añadir un sonido de tiempo agotado aquí
            setMessage("El tiempo se ha agotado... La oscuridad te consume.");
            endGame(false); // Derrota por tiempo
        }
    }, 1000);
}

/**
 * Inicia el juego.
 */
function startGame() {
    console.log("Iniciando juego...");
    startScreen.style.display = 'none';
    gameContainer.style.display = 'flex';
    inventory = []; // Reinicia inventario

    // --- Reinicio de Flags usando la copia inicial ---
    for (const roomKey in rooms) {
        if (rooms[roomKey].flags) { // Si la sala actual tiene flags
             // Busca la definición inicial de esta sala en la copia
            const initialRoomData = roomsDataForReset[roomKey];
            if (initialRoomData && initialRoomData.flags) {
                // Restaura las flags a partir de la copia inicial
                rooms[roomKey].flags = { ...initialRoomData.flags };
                 console.log(`Flags reseteadas para ${roomKey}:`, rooms[roomKey].flags);
            } else {
                // Si por alguna razón no hay flags iniciales (no debería pasar si están definidas)
                rooms[roomKey].flags = {};
            }
        }
    }
    // --- Fin del Reinicio de Flags ---

    updateInventory(); // Actualiza UI de inventario (vacío)
    changeRoom('sotano'); // Carga sala inicial
    // La música se inicia en changeRoom
    startTimer(); // Inicia el temporizador
}

/**
 * Cambia la sala actual.
 * @param {string} roomId - ID de la sala a cargar.
 */
function changeRoom(roomId) {
    if (!rooms[roomId]) {
        console.error(`Error: La sala "${roomId}" no existe.`);
        return;
    }
    currentRoom = rooms[roomId];
    roomImage.src = currentRoom.image;
    setMessage(currentRoom.message);
    clearActionMessage();
    renderInteractiveObjects();
    playMusic(currentRoom.backgroundMusic); // Asegura que la música correcta suene
     console.log(`Cambiado a la sala: ${roomId}`);
     console.log("Flags actuales:", currentRoom.flags); // Log para depurar flags al cambiar sala
}

/**
 * Dibuja las áreas interactivas de la sala actual.
 */
function renderInteractiveObjects() {
    const existingAreas = roomElement.querySelectorAll('.interactive-area');
    existingAreas.forEach(area => area.remove());

    if (currentRoom.objects) {
        currentRoom.objects.forEach(obj => {
            const area = document.createElement('div');
            area.classList.add('interactive-area');
            area.style.top = obj.coords.top;
            area.style.left = obj.coords.left;
            area.style.width = obj.coords.width;
            area.style.height = obj.coords.height;
            area.dataset.objectId = obj.id;
            // V V V ESTA ES LA LÍNEA QUE TIENES QUE QUITAR O COMENTAR V V V
            // area.title = obj.name; // Tooltip con el nombre
            // ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^
            area.addEventListener('click', () => handleInteraction(obj.id));
            roomElement.appendChild(area);
        });
    }
}

/**
 * Maneja la interacción con un objeto.
 * @param {string} objectId - ID del objeto clickeado.
 */
function handleInteraction(objectId) {
    const obj = currentRoom.objects.find(o => o.id === objectId);
    if (obj && obj.action) {
        console.log(`Interactuando con: ${objectId}`);
        const gameState = {
            inventory: inventory,
            flags: currentRoom.flags || {}
        };
        obj.action(gameState);
    } else {
        console.warn(`Objeto interactivo no encontrado o sin acción: ${objectId}`);
         setActionMessage("No puedes interactuar con eso.");
    }
}

/**
 * Muestra un mensaje principal.
 * @param {string} text - Texto a mostrar.
 */
function setMessage(text) {
    roomMessage.textContent = text;
    // clearActionMessage(); // Decidí quitar esto para que los mensajes de acción persistan un poco más
}

/**
 * Muestra un mensaje de acción.
 * @param {string} text - Texto a mostrar.
 */
function setActionMessage(text) {
    actionMessage.textContent = text;
}

/**
 * Limpia el mensaje de acción.
 */
function clearActionMessage() {
     actionMessage.textContent = "";
}

/**
 * Añade un ítem al inventario.
 * @param {string} itemId - ID del ítem.
 * @param {string} [itemIcon='images/item_default.png'] - Icono del ítem.
 */
function addItem(itemId, itemIcon = 'images/item_default.png') {
    if (!inventory.includes(itemId)) {
        inventory.push(itemId);
        // updateInventory(itemIcon); // <--- COMENTA O ELIMINA ESTA LÍNEA
        updateInventory();         // <--- AÑADE ESTA LÍNEA (Llama sin parámetro)
        setActionMessage(`Has recogido: ${itemId.replace(/_/g, ' ')}`);
        playSound(sfxItemPickup);
         console.log("Inventario actual:", inventory);
    } else {
         setActionMessage(`Ya tienes ${itemId.replace(/_/g, ' ')}.`);
    }
}

/**
 * Añade un ítem al inventario.
 * @param {string} itemId - ID del ítem.
 * @param {string} [itemIcon='images/item_default.png'] - Icono del ítem (ya no se pasa a updateInventory).
 */
function addItem(itemId, itemIcon = 'images/item_default.png') { // Mantenemos el parámetro por si acaso, pero no lo usamos abajo
    if (!inventory.includes(itemId)) {
        inventory.push(itemId);
        // updateInventory(itemIcon); // <--- LÍNEA ANTERIOR COMENTADA/ELIMINADA
        updateInventory();         // <--- NUEVA LLAMADA (sin parámetro de icono)
        setActionMessage(`Has recogido: ${itemId.replace(/_/g, ' ')}`);
        playSound(sfxItemPickup);
        console.log("Inventario actual:", inventory);
    } else {
         setActionMessage(`Ya tienes ${itemId.replace(/_/g, ' ')}.`);
    }
}


/**
 * Actualiza la lista de inventario en la UI.
 * ¡YA NO ACEPTA el parámetro iconForLastItem!
 */
function updateInventory() {  // <--- FIRMA DE LA FUNCIÓN MODIFICADA
    inventoryList.innerHTML = ''; // Limpiar lista
    inventory.forEach((item) => { // Ya no necesitamos 'index' aquí
        const li = document.createElement('li');
        const img = document.createElement('img');

        // --- SIEMPRE CONSTRUYE LA RUTA DESDE EL ID DEL ITEM ---
        img.src = `images/${item}.png`; // Construye la ruta consistentemente
        // --- FIN DE LA LÍNEA MODIFICADA ---

        img.alt = item;
        // Fallback si la imagen específica no carga (con log mejorado)
        img.onerror = () => {
             console.warn(`Icono no encontrado o error al cargar: 'images/${item}.png'. Usando default.`);
             img.src = 'images/item_default.png'; // Usa un icono genérico si falla
        };
        li.appendChild(img);
        li.appendChild(document.createTextNode(item.replace(/_/g, ' '))); // Nombre legible
        inventoryList.appendChild(li);
    });
}

/**
 * Reproduce un efecto de sonido.
 * @param {HTMLAudioElement} audioElement - Elemento de audio a reproducir.
 */
function playSound(audioElement) {
    if (!isMuted && audioElement) {
         audioElement.currentTime = 0;
        audioElement.play().catch(e => console.error("Error al reproducir SFX:", e));
    }
}

/**
 * Reproduce música de fondo.
 * @param {HTMLAudioElement | null} musicElement - Elemento de audio a reproducir o null.
 */
function playMusic(musicElement) {
    if (currentBGM === musicElement && currentBGM && !currentBGM.paused) return;
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
    }
    currentBGM = musicElement;
    if (!isMuted && currentBGM) {
        currentBGM.volume = 0.3;
        currentBGM.play().catch(e => console.error("Error al reproducir BGM:", e));
    }
}

/**
 * Detiene la música de fondo.
 */
function stopMusic() {
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
    }
    currentBGM = null;
}

/**
 * Activa/Desactiva el sonido.
 */
function toggleMute() {
    isMuted = !isMuted;
    muteButton.textContent = isMuted ? '🔊 Unmute' : '🔇 Mute';
    if (isMuted) {
        if (currentBGM) currentBGM.pause();
    } else {
        if (currentBGM) currentBGM.play().catch(e => console.error("Error al reanudar BGM:", e));
    }
    console.log("Muted state:", isMuted);
}

/**
 * Muestra un jumpscare.
 * @param {string} imageSrc - Ruta de la imagen del susto.
 * @param {HTMLAudioElement} soundEffect - Sonido del susto.
 * @param {number} [duration=1000] - Duración en ms.
 */
function triggerJumpScare(imageSrc, soundEffect, duration = 700) { // Duración ligeramente menor
    console.log("¡SUSTO!");
    jumpscareImage.src = imageSrc;
    jumpscareElement.classList.remove('jumpscare-hidden');
    jumpscareElement.classList.add('jumpscare-visible');
    playSound(soundEffect);

    setTimeout(() => {
        jumpscareElement.classList.remove('jumpscare-visible');
        jumpscareElement.classList.add('jumpscare-hidden');
    }, duration);
}

/**
 * Termina el juego.
 * @param {boolean} isVictory - True si es victoria, false si es derrota.
 */
function endGame(isVictory) {
    console.log("Fin del juego. Victoria:", isVictory);

    // --- DETENER TEMPORIZADOR ---
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    // --- ---

    stopMusic(); // Detiene la música
    gameContainer.style.display = 'none'; // Oculta juego

    // --- Crear pantalla final dinámicamente ---
    const endScreen = document.createElement('div');
    endScreen.id = 'end-screen';
    endScreen.style.textAlign = 'center';
    endScreen.style.padding = '30px';
    endScreen.style.backgroundColor = '#111';
    endScreen.style.border = `2px solid ${isVictory ? '#4CAF50' : '#b71c1c'}`; // Borde verde o rojo
    endScreen.style.borderRadius = '10px';
    endScreen.style.color = '#eee';
    endScreen.style.position = 'absolute';
    endScreen.style.top = '50%';
    endScreen.style.left = '50%';
    endScreen.style.transform = 'translate(-50%, -50%)';
    endScreen.style.zIndex = '1000';
    endScreen.style.maxWidth = '500px'; // Ancho máximo

    const title = document.createElement('h1');
    title.style.fontFamily = "'Creepster', cursive";
    title.style.fontSize = '3em';
    title.style.color = isVictory ? '#4CAF50' : '#b71c1c';

    const message = document.createElement('p');
    message.style.fontSize = '1.2em';
    message.style.lineHeight = '1.6';

    // --- Mensaje final mejorado ---
    let finalMessage = '';
    if (isVictory) {
        title.textContent = '¡Has Escapado!';
        const minutesLeft = Math.floor(remainingTime / 60);
        const secondsLeft = remainingTime % 60;
        finalMessage = `Lograste abrir la puerta y salir a la fría noche con ${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')} restantes. Eres libre... por ahora.`;
        playSound(sfxUnlock);
    } else {
        if (remainingTime <= 0) { // Derrota por tiempo
            title.textContent = '¡Tiempo Agotado!';
            finalMessage = 'Las manecillas marcaron el final. La oscuridad te consume y la mansión te reclama...';
            playSound(sfxLocked); // Sonido de derrota por tiempo (ejemplo)
        } else { // Otra derrota (si se implementara)
            title.textContent = 'Atrapado para Siempre';
            finalMessage = 'Cometiste un error fatal o te rendiste ante el horror. La mansión te reclama...';
            playSound(sfxJumpScare1); // Sonido de derrota genérica
        }
    }
    message.textContent = finalMessage;
    // --- Fin del mensaje final mejorado ---

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Jugar de Nuevo';
    // Estilos del botón
    restartButton.style.padding = '12px 25px';
    restartButton.style.fontSize = '1.3em';
    restartButton.style.cursor = 'pointer';
    restartButton.style.backgroundColor = '#444';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.marginTop = '25px';
    restartButton.style.transition = 'background-color 0.3s ease, transform 0.1s ease';
    restartButton.onmouseover = () => { restartButton.style.backgroundColor = '#666'; restartButton.style.transform = 'scale(1.05)'; };
    restartButton.onmouseout = () => { restartButton.style.backgroundColor = '#444'; restartButton.style.transform = 'scale(1)'; };
    restartButton.onmousedown = () => { restartButton.style.transform = 'scale(0.98)'; };
    restartButton.onmouseup = () => { restartButton.style.transform = 'scale(1.05)'; }; // Vuelve a tamaño hover

    restartButton.onclick = () => {
        document.body.removeChild(endScreen); // Quitar pantalla final
        startScreen.style.display = 'block'; // Mostrar pantalla inicial
        // --- Resetear visualización del timer ---
        timerDisplay.textContent = "10:00"; // Tiempo inicial
        timerDisplay.classList.remove('low-time');
        timerDisplay.style.color = '#ffc107'; // Color inicial
        // --- ---
    };

    endScreen.appendChild(title);
    endScreen.appendChild(message);
    endScreen.appendChild(restartButton);
    document.body.appendChild(endScreen); // Añadir al body
}

// --- Inicialización ---
startButton.addEventListener('click', startGame);
muteButton.addEventListener('click', toggleMute);

// --- Precarga de Audio ---
window.addEventListener('load', () => {
   try {
        console.log("Intentando precargar audio...");
        bgmSuspense.load();
        bgmCreepy.load();
        sfxJumpScare1.load();
        sfxDoorCreak.load();
        sfxItemPickup.load();
        sfxUnlock.load();
        sfxLocked.load();
        sfxWhisper.load();
        sfxBang.load();
        console.log("Recursos de audio solicitados para precarga.");
   } catch (error) {
        console.error("Error durante la precarga de audio:", error)
   }
});
