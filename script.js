// --- Selección de Elementos del DOM ---
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const roomImage = document.getElementById('room-image');
const roomElement = document.getElementById('room');
const roomMessage = document.getElementById('room-message');
const actionMessage = document.getElementById('action-message');
const inventoryList = document.getElementById('inventory-list');
const jumpscareElement = document.getElementById('jumpscare');
const jumpscareImage = document.getElementById('jumpscare-image');
const muteButton = document.getElementById('mute-button');
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

// --- Variables de Estado del Juego ---
let currentRoom = null;
let inventory = [];
let isMuted = false;
let currentBGM = null;
let timerInterval = null;
const initialTime = 10 * 60;
let remainingTime = initialTime;
let uselessClickCounter = 0;
const USELESS_CLICK_LIMIT = 10;

// --- Definición de las Salas y Objetos ---
const rooms = {
    // --- SALA 1: EL SÓTANO ---
    sotano: {
        image: 'images/room1.jpeg',
        message: 'Estás en un sótano húmedo y oscuro. Huele a tierra mojada y... a algo más. Hay una puerta de madera al fondo.',
        backgroundMusic: bgmCreepy,
        objects: [
            { id: 'puerta_madera_sotano', name: 'Puerta de madera', coords: { top: '56%', left: '45%', width: '2%', height: '6%' },
                action: (state) => { /* ... (sin cambios aquí) ... */
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
                action: (state) => { /* ... (sin cambios aquí) ... */
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
                     // *** DIARIO: Añadida pista de símbolo (*) ***
                     setMessage('Una tubería vieja y oxidada gotea sin cesar. El sonido es inquietante. Notas un extraño símbolo [*] grabado en la junta.');
                     if (!state.flags.sotano_tuberia_susto && Math.random() < 0.7) {
                        triggerJumpScare('images/scare1.png', sfxJumpScare1, 2000);
                        playSound(sfxWhisper);
                        state.flags.sotano_tuberia_susto = true;
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
                action: (state) => { /* ... (sin cambios aquí) ... */
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
                    // *** DIARIO: Añadida pista de símbolo ($) y modificada descripción clave 8 ***
                     setMessage('Un retrato de aspecto severo. Los ojos parecen seguirte... En la esquina inferior derecha está el número "8". Justo debajo del marco, en la pared, hay un símbolo [$] casi borrado.');
                }
            },
            { id: 'reloj_parado', name: 'Reloj de pie parado', coords: { top: '41%', left: '42%', width: '2%', height: '4%' },
                action: (state) => {
                    // *** DIARIO: Añadida pista de símbolo (#) y modificada descripción clave 4 y 2 ***
                     setMessage('Un reloj de abuelo cubierto de polvo. Está parado. Las manecillas marcan las 4. El número 2 está arañado. En lugar del número 6, hay un símbolo grabado: [#].');
                }
            },
            { id: 'puerta_vestibulo', name: 'Puerta al Vestíbulo Principal', coords: { top: '55%', left: '30%', width: '2%', height: '6%' },
                action: (state) => { /* ... (sin cambios aquí) ... */
                    setMessage("Atraviesas la puerta hacia lo que parece ser el vestíbulo principal de la mansión.");
                    playSound(sfxDoorCreak);
                    changeRoom('vestibulo');
                }
            },
            { id: 'puerta_dormitorio', name: 'Puerta al Dormitorio', coords: { top: '60%', left: '80%', width: '2%', height: '6%' },
                action: (state) => { /* ... (sin cambios aquí) ... */
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
                action: (state) => { /* ... (sin cambios aquí) ... */
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
                action: (state) => { /* ... (sin cambios aquí) ... */
                    if (!state.inventory.includes('gear')) {
                        setMessage('Miles de libros. Uno parece fuera de lugar... ¡Ajá! Detrás de un tomo falso, encuentras un pequeño engranaje dorado.');
                        playSound(sfxItemPickup);
                        addItem('gear', 'images/gear.png');
                    } else {
                        setMessage('Ya has buscado bien en las estanterías.');
                    }
                 }
            },
            // *** DIARIO: Lógica completamente nueva para el escritorio ***
            { id: 'escritorio_biblio', name: 'Escritorio', coords: { top: '69%', left: '35%', width: '7%', height: '3%' },
                 action: (state) => {
                     // Comprobar si el diario ya se abrió
                     if (state.flags.biblioteca_diario_abierto) {
                         setMessage('El diario yace abierto sobre el escritorio. Recuerdas lo que leíste: "El guardián final requiere el metal del tiempo y el oro del saber..."');
                     }
                     // Comprobar si ya se encontró el diario pero no se ha abierto
                     else if (state.flags.biblioteca_diario_encontrado) {
                         setMessage('El diario cerrado está sobre el escritorio. Tiene un candado con 4 ruedas de símbolos. Quizás ahora sepas la combinación...');
                         const codigoDiario = prompt("Introduce los 4 símbolos en orden:");
                         const codigoCorrecto = "*#@$"; // Código: Tubería-Reloj-Mecedora-Cuadro

                         if (codigoDiario === codigoCorrecto) {
                            setMessage('¡Correcto! Los símbolos giran y el candado se abre con un clic. Lees la última entrada: "El guardián final requiere el metal del tiempo y el oro del saber..."');
                            playSound(sfxUnlock);
                            state.flags.biblioteca_diario_abierto = true; // Marcar como abierto
                            // Opcional: ¿Añadir un item 'diario_abierto' al inventario? Por ahora no, usamos la flag.
                         } else if (codigoDiario) { // Si introdujo algo pero es incorrecto
                            setMessage('Eso no parece funcionar. El candado sigue cerrado.');
                            playSound(sfxLocked);
                         } else { // Si canceló o no puso nada
                            setActionMessage("No intentaste ninguna combinación.");
                         }
                     }
                     // Si el diario aún no se ha encontrado
                     else {
                         setMessage('Sobre el polvoriento escritorio encuentras un viejo diario de cuero. Está cerrado con un extraño candado que requiere 4 símbolos.');
                         // *** DIARIO: No añadimos item al inventario, usamos flags ***
                         // addItem('diario_cerrado', 'images/diary_locked.png'); // No hacemos esto
                         playSound(sfxItemPickup); // Sonido de encontrar algo
                         state.flags.biblioteca_diario_encontrado = true; // Marcar como encontrado
                     }
                 }
            },
             { id: 'puerta_pasillo_biblio', name: 'Puerta al Pasillo', coords: { top: '55%', left: '81%', width: '2%', height: '6%' },
                action: (state) => { /* ... (sin cambios aquí) ... */
                    playSound(sfxDoorCreak);
                    changeRoom('pasillo');
                }
             }
        ],
         flags: {
             // biblioteca_nota_leida: false, // *** DIARIO: Eliminada esta flag ***
             biblioteca_diario_encontrado: false, // *** DIARIO: Nueva flag ***
             biblioteca_diario_abierto: false,   // *** DIARIO: Nueva flag ***
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
                     let msg = 'La mecedora cruje y se balancea sola. Te da escalofríos.';
                     // *** DIARIO: Añadida pista de símbolo (@) ***
                     msg += ' En el reposabrazos, notas un símbolo [@], como si alguien lo hubiera marcado.';
                     setMessage(msg);

                    if (!state.flags.dormitorio_mecedora_susto) {
                        setTimeout(() => {
                            playSound(sfxBang);
                            setMessage('¡La mecedora se detiene de golpe! El símbolo [@] sigue ahí.'); // Mensaje actualizado tras susto
                        }, 600);
                         state.flags.dormitorio_mecedora_susto = true;
                    }
                 }
            },
            { id: 'cama_dosel', name: 'Cama con dosel', coords: { top: '83%', left: '39%', width: '2%', height: '6%' },
                 action: (state) => { /* ... (sin cambios aquí) ... */
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
                action: (state) => { /* ... (sin cambios aquí) ... */
                    if (!state.flags.dormitorio_puerta_abierta && state.inventory.includes('crowbar')) {
                        setMessage('Usas la palanca para forzar la puerta atascada. ¡Se abre!');
                        playSound(sfxBang);
                        playSound(sfxDoorCreak);
                        state.flags.dormitorio_puerta_abierta = true;
                        changeRoom('pasillo');
                    }
                    else if (state.flags.dormitorio_puerta_abierta) {
                        playSound(sfxDoorCreak);
                        changeRoom('pasillo');
                    }
                    else {
                        setMessage('La puerta está bloqueada desde este lado. Parece necesitar algo para forzarla.');
                        playSound(sfxLocked);
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
                    // *** DIARIO: Mensaje modificado para referenciar el diario/pista ***
                    if (state.inventory.includes('crowbar') && state.inventory.includes('gear')) {
                        setMessage('Recordando la pista del diario sobre "el metal del tiempo y el oro del saber", colocas el engranaje dorado en una ranura y usas la palanca metálica en un mecanismo. La cerradura hace un ruido sordo y ¡LA PUERTA SE ABRE! Has escapado... ¿o no?');
                        playSound(sfxUnlock);
                        endGame(true); // Victoria
                    } else if (state.inventory.includes('crowbar')) {
                        setMessage('Hay una ranura que parece necesitar algún tipo de engranaje dorado... El diario mencionaba "oro del saber".');
                        playSound(sfxLocked);
                    } else if (state.inventory.includes('gear')) {
                         setMessage('Hay un mecanismo que parece necesitar una palanca resistente para activarlo... El diario mencionaba "metal del tiempo".');
                         playSound(sfxLocked);
                    } else {
                        // *** DIARIO: Mensaje modificado ***
                        setMessage('La cerradura es compleja. El viejo diario que encontraste tenía una pista sobre "el metal del tiempo y el oro del saber", pero necesitas encontrar esos objetos.');
                        playSound(sfxLocked);
                    }
                }
            },
            { id: 'volver_pasillo_vestibulo', name: 'Volver al Pasillo', coords: { top: '56%', left: '11%', width: '2%', height: '6%' },
                action: (state) => { /* ... (sin cambios aquí) ... */
                     playSound(sfxDoorCreak);
                     changeRoom('pasillo');
                }
            }
        ],
        flags: {}
    },
};

// --- IMPORTANTE: Copia profunda inicial para resetear flags ---
// Actualizado para incluir las nuevas flags de la biblioteca
const roomsDataForReset = JSON.parse(JSON.stringify(rooms));


// --- Funciones del Juego ---

// *** DIARIO: No hay cambios en las funciones principales fuera de las acciones de los objetos ***
// ... (Las funciones updateTimerDisplay, startTimer, startGame, changeRoom, renderInteractiveObjects,
// handleInteraction, checkUselessClick, listeners, setMessage, setActionMessage, clearActionMessage,
// addItem, updateInventory, playSound, playMusic, stopMusic, toggleMute, triggerJumpScare, endGame
// permanecen IGUAL que en la versión anterior que te proporcioné) ...

// ¡ASEGÚRATE DE COPIAR LAS FUNCIONES COMPLETAS DESDE LA VERSIÓN ANTERIOR SI ESTÁS REEMPLAZANDO TODO EL ARCHIVO!
// PEGO LAS FUNCIONES OTRA VEZ POR SI ACASO:

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
         timerDisplay.style.color = '#b71c1c';
    } else {
         if (seconds > 60) timerDisplay.style.color = '#ffc107';
    }
}

function startTimer() {
    if (timerInterval) { clearInterval(timerInterval); }
    remainingTime = initialTime;
    updateTimerDisplay(remainingTime);
    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay(remainingTime);
        if (remainingTime <= 0) {
            console.log("¡Tiempo agotado!");
            clearInterval(timerInterval);
            timerInterval = null;
            setMessage("El tiempo se ha agotado... La oscuridad te consume.");
            endGame(false);
        }
    }, 1000);
}

function startGame() {
    console.log("Iniciando juego...");
    uselessClickCounter = 0; // Resetear contador de clics inútiles
    startScreen.style.display = 'none';
    gameContainer.style.display = 'flex';
    inventory = []; // Reinicia inventario

    // --- Reinicio de Flags usando la copia inicial ---
    // ¡¡IMPORTANTE!! roomsDataForReset ahora ya incluye las nuevas flags con valor false
    for (const roomKey in rooms) {
        if (rooms[roomKey].flags) {
            const initialRoomData = roomsDataForReset[roomKey];
            if (initialRoomData && initialRoomData.flags) {
                rooms[roomKey].flags = { ...initialRoomData.flags };
                 console.log(`Flags reseteadas para ${roomKey}:`, rooms[roomKey].flags);
            } else {
                rooms[roomKey].flags = {};
            }
        }
    }
    // --- Fin del Reinicio de Flags ---

    updateInventory(); // Actualiza UI de inventario (vacío)
    changeRoom('sotano'); // Carga sala inicial
    startTimer(); // Inicia el temporizador
}


function changeRoom(roomId) {
    if (!rooms[roomId]) {
        console.error(`Error: La sala "${roomId}" no existe.`);
        return;
    }
    uselessClickCounter = 0; // Resetear contador al cambiar de sala
    currentRoom = rooms[roomId];
    roomImage.src = currentRoom.image;
    setMessage(currentRoom.message);
    clearActionMessage();
    renderInteractiveObjects();
    playMusic(currentRoom.backgroundMusic); // Asegura que la música correcta suene
     console.log(`Cambiado a la sala: ${roomId}`);
     console.log("Flags actuales:", currentRoom.flags); // Log para depurar flags al cambiar sala
}


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
            // area.title = obj.name; // Tooltip quitado
            area.addEventListener('click', () => handleInteraction(obj.id));
            roomElement.appendChild(area);
        });
    }
}


function handleInteraction(objectId) {
    uselessClickCounter = 0; // Resetear contador al intentar interactuar
    const obj = currentRoom.objects.find(o => o.id === objectId);
    if (obj && obj.action) {
        console.log(`Interactuando con: ${objectId}`);
        const gameState = {
            inventory: inventory,
            flags: currentRoom.flags || {}
        };
        obj.action(gameState);
    } else {
        // Si el ID no corresponde a un objeto interactivo DEFINIDO, podría ser un clic "inútil"
        // pero lo manejamos en el listener del fondo para simplificar.
        console.warn(`Objeto interactivo no encontrado o sin acción: ${objectId}`);
        setActionMessage("No parece haber nada interesante ahí."); // Mensaje genérico para clics en áreas sin acción definida (si las hubiera)
        // checkUselessClick(); // No incrementar aquí para evitar doble conteo si el clic también cae en el fondo
    }
}


function checkUselessClick() {
    uselessClickCounter++;
    console.log(`Clic inútil número: ${uselessClickCounter}`);
    if (uselessClickCounter > USELESS_CLICK_LIMIT) {
        console.log("¡Susto por clics inútiles!");
        triggerJumpScare('images/scare1.png', sfxJumpScare1, 700);
        uselessClickCounter = 0; // Resetea después del susto
    }
}


roomElement.addEventListener('click', (event) => {
    // Solo cuenta si el clic es en el contenedor o la imagen, no en un área interactiva.
    if (event.target === roomElement || event.target === roomImage) {
        checkUselessClick();
    }
});


function setMessage(text) {
    roomMessage.textContent = text;
}

function setActionMessage(text) {
    actionMessage.textContent = text;
}

function clearActionMessage() {
     actionMessage.textContent = "";
}

function addItem(itemId, itemIcon = 'images/item_default.png') {
    if (!inventory.includes(itemId)) {
        inventory.push(itemId);
        updateInventory();
        setActionMessage(`Has recogido: ${itemId.replace(/_/g, ' ')}`);
        playSound(sfxItemPickup);
        console.log("Inventario actual:", inventory);
         uselessClickCounter = 0; // Resetear contador al añadir item útil
    } else {
         setActionMessage(`Ya tienes ${itemId.replace(/_/g, ' ')}.`);
    }
}


function updateInventory() {
    inventoryList.innerHTML = '';
    inventory.forEach((item) => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = `images/${item}.png`;
        img.alt = item;
        img.onerror = () => {
             console.warn(`Icono no encontrado o error al cargar: 'images/${item}.png'. Usando default.`);
             img.src = 'images/item_default.png';
        };
        li.appendChild(img);
        li.appendChild(document.createTextNode(item.replace(/_/g, ' ')));
        inventoryList.appendChild(li);
    });
}


function playSound(audioElement) {
    if (!isMuted && audioElement) {
         audioElement.currentTime = 0;
        audioElement.play().catch(e => console.error("Error al reproducir SFX:", e));
    }
}


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


function stopMusic() {
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
    }
    currentBGM = null;
}


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


function triggerJumpScare(imageSrc, soundEffect, duration = 700) { // Duración por defecto 700ms
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


function endGame(isVictory) {
    console.log("Fin del juego. Victoria:", isVictory);
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    stopMusic();
    gameContainer.style.display = 'none';

    const endScreen = document.createElement('div');
    endScreen.id = 'end-screen';
    endScreen.style.textAlign = 'center';
    endScreen.style.padding = '30px';
    endScreen.style.backgroundColor = '#111';
    endScreen.style.border = `2px solid ${isVictory ? '#4CAF50' : '#b71c1c'}`;
    endScreen.style.borderRadius = '10px';
    endScreen.style.color = '#eee';
    endScreen.style.position = 'absolute';
    endScreen.style.top = '50%';
    endScreen.style.left = '50%';
    endScreen.style.transform = 'translate(-50%, -50%)';
    endScreen.style.zIndex = '1000';
    endScreen.style.maxWidth = '500px';

    const title = document.createElement('h1');
    title.style.fontFamily = "'Creepster', cursive";
    title.style.fontSize = '3em';
    title.style.color = isVictory ? '#4CAF50' : '#b71c1c';

    const message = document.createElement('p');
    message.style.fontSize = '1.2em';
    message.style.lineHeight = '1.6';

    let finalMessage = '';
    if (isVictory) {
        title.textContent = '¡Has Escapado!';
        const minutesLeft = Math.floor(remainingTime / 60);
        const secondsLeft = remainingTime % 60;
        finalMessage = `Lograste abrir la puerta y salir a la fría noche con ${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')} restantes. Eres libre... por ahora.`;
        playSound(sfxUnlock);
    } else {
        if (remainingTime <= 0) {
            title.textContent = '¡Tiempo Agotado!';
            finalMessage = 'Las manecillas marcaron el final. La oscuridad te consume y la mansión te reclama...';
            playSound(sfxLocked);
        } else {
            title.textContent = 'Atrapado para Siempre';
            finalMessage = 'Cometiste un error fatal o te rendiste ante el horror. La mansión te reclama...';
            playSound(sfxJumpScare1);
        }
    }
    message.textContent = finalMessage;

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Jugar de Nuevo';
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
    restartButton.onmouseup = () => { restartButton.style.transform = 'scale(1.05)'; };
    restartButton.onclick = () => {
        document.body.removeChild(endScreen);
        startScreen.style.display = 'block';
        timerDisplay.textContent = "10:00";
        timerDisplay.classList.remove('low-time');
        timerDisplay.style.color = '#ffc107';
    };

    endScreen.appendChild(title);
    endScreen.appendChild(message);
    endScreen.appendChild(restartButton);
    document.body.appendChild(endScreen);
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
