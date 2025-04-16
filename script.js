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
// *** NUEVO: Contador para clics inútiles ***
let uselessClickCounter = 0;
const USELESS_CLICK_LIMIT = 10; // Límite de clics antes del susto

// --- Definición de las Salas y Objetos ---
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
                    if (state.inventory.includes('crowbar') && state.inventory.includes('gear')) {
                        setMessage('Colocas el engranaje dorado en una ranura y usas la palanca metálica en un mecanismo. La cerradura hace un ruido sordo y ¡LA PUERTA SE ABRE! Has escapado... ¿o no?');
                        playSound(sfxUnlock);
                        endGame(true);
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
const roomsDataForReset = JSON.parse(JSON.stringify(rooms));


// --- Funciones del Juego ---

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
    uselessClickCounter = 0; // *** NUEVO: Resetear contador de clics inútiles ***
    startScreen.style.display = 'none';
    gameContainer.style.display = 'flex';
    inventory = [];
    for (const roomKey in rooms) {
        if (rooms[roomKey].flags) {
            const initialRoomData = roomsDataForReset[roomKey];
            if (initialRoomData && initialRoomData.flags) {
                rooms[roomKey].flags = { ...initialRoomData.flags };
            } else {
                rooms[roomKey].flags = {};
            }
        }
    }
    updateInventory();
    changeRoom('sotano');
    startTimer();
}

function changeRoom(roomId) {
    if (!rooms[roomId]) {
        console.error(`Error: La sala "${roomId}" no existe.`);
        return;
    }
    uselessClickCounter = 0; // *** NUEVO: Resetear contador al cambiar de sala ***
    currentRoom = rooms[roomId];
    roomImage.src = currentRoom.image;
    setMessage(currentRoom.message);
    clearActionMessage();
    renderInteractiveObjects();
    playMusic(currentRoom.backgroundMusic);
    console.log(`Cambiado a la sala: ${roomId}`);
    console.log("Flags actuales:", currentRoom.flags);
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
    uselessClickCounter = 0; // *** NUEVO: Resetear contador al intentar interactuar ***
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
        // *** NUEVO: Podríamos incrementar el contador aquí si la interacción es "falsa", pero lo simplificamos ***
        // checkUselessClick(); // No lo hacemos aquí, lo hacemos en el listener del fondo
    }
}

// *** NUEVO: Función para comprobar y ejecutar susto por clics inútiles ***
function checkUselessClick() {
    uselessClickCounter++;
    console.log(`Clic inútil número: ${uselessClickCounter}`);
    if (uselessClickCounter > USELESS_CLICK_LIMIT) {
        console.log("¡Susto por clics inútiles!");
        // Usamos duración corta (1400ms) para este susto, diferente al de la tubería
        triggerJumpScare('images/scare1.png', sfxJumpScare1, 1400);
        uselessClickCounter = 0; // Resetea después del susto
    }
}

// *** NUEVO: Listener para clics en el fondo de la sala ***
roomElement.addEventListener('click', (event) => {
    // Comprueba si el clic fue DIRECTAMENTE en el contenedor de la sala
    // o en la imagen de fondo, y NO en un área interactiva que ya
    // maneja su propio evento de clic (y resetea el contador).
    if (event.target === roomElement || event.target === roomImage) {
         // También podrías comprobar !event.target.classList.contains('interactive-area')
         // pero comprobar el target directo suele ser suficiente si las áreas cubren bien.
        checkUselessClick();
    }
    // Si el clic fue en un '.interactive-area', el contador ya se reseteó en handleInteraction.
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
         uselessClickCounter = 0; // *** NUEVO: Resetear contador al añadir item ***
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
    // *** CORRECCIÓN: El texto inicial del botón en HTML era Mute con icono volumen ***
    // *** Asegurémonos de que la lógica sea consistente ***
    // Si ahora está muteado (isMuted es true), el botón debe mostrar Unmute con icono SIN volumen
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
