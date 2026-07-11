import { Question } from '../../types/quiz';

type Row = [string, number, string, string, string];
const rows: Row[] = [
  ['What sign will constitute an offense if it will be disregarded?', 0, 'Regulatory sign', 'Informative sign', 'Warning sign'],
  ['A flashing green light means:', 2, 'Full stop', 'Proceed with caution', 'Slow down and be ready to stop where a pedestrian crosses the street'],
  ['What does this traffic sign mean? (Traffic light icon)', 2, 'Pedestrian crossing', 'Starting point for walking', 'Traffic light signals ahead'],
  ['A pedestrian runs across the street when you are about to move off from a red light. What should you do?', 2, 'Blow your horn and proceed', 'Drive around the pedestrian', 'Wait until the pedestrian has crossed'],
  ['A driver while on a highway shall yield the right of way to:', 1, 'Vehicles entering from private driveways', 'Pedestrians crossing within a crosswalk', 'Heavy trucks rushing their deliveries'],
  ['Among the list, who are exempted from speed limits?', 0, 'Doctors or their drivers going to an emergency', 'Drivers delivering perishable goods', 'Government officials rushing to a meeting'],
  ['When do you need to switch on your turn signal?', 2, 'After turning', 'While turning', 'Before turning'],
  ['What is the maximum penalty for driving under the influence of liquor or prohibited drugs?', 2, '6 months suspension', '1 year suspension', 'Perpetual revocation of license'],
  ['If the brake light of the vehicle in front of you lights up, you should:', 0, 'Prepare to brake', 'Press the horn', 'Turn right or left'],
  ['The primary objective of looking ahead while driving is:', 1, 'To check your dashboard instruments', 'To check the traffic ahead and changes of road condition', 'To look at the scenery along the highway'],
  ['What is the meaning of this traffic light? (Yellow light)', 0, 'Prepare to stop', 'Stop if the red light comes', 'Stop if necessary'],
  ['You are planning a long trip. Do you need to plan rest stops?', 1, 'No, it wastes precious travel time', 'Yes, regular stops help avoid mental and physical fatigue', 'Only if your motorcycle needs to cool down'],
  ['During periods of illness, your ability to drive may be impaired. You must:', 1, 'Drive faster to reach your destination immediately', 'Be physically and mentally fit and do not drive after taking medicine', 'Only drive if accompanied by a licensed adult'],
  ["Under RA 10666, the child must grasp the rider's waist, rest their feet on the foot peg, and:", 1, 'Must sit in front of the rider', 'Must wear a standard protective helmet', 'Must hold a secure safety rope tied to the motorcycle'],
  ['A blinking yellow traffic light means:', 1, 'Come to a complete stop', 'Slow down and proceed if there is no danger', 'Ignore the light and maintain your current speed'],
  ['When do you need to check your engine oil level?', 1, 'Right after a long ride', 'When the engine is cold', 'While the motorcycle is idling'],
  ['Yellow box pavement marking is painted within intersections where no vehicle is allowed to:', 2, 'Turn left', 'Speed up', 'Stop'],
  ['What should the driver do if already within the intersection when the yellow traffic light comes?', 1, 'Stop abruptly in the middle', 'Continue driving with caution', 'Reverse back to the stop line'],
  ['Why are rumble strips installed across the road?', 1, 'To protect the asphalt from wear and tear', 'To make you alert and aware of your speed', 'To act as a lane divider for large trucks'],
  ['Which one is a mandate of LTO?', 1, 'Building highways and bridges', 'Register roadworthy and emission-compliant motor vehicles', 'Enforcing municipal garbage disposal laws'],
  ['When the yellow light changes to red, a vehicle already in the intersection to turn left or right may:', 0, 'Continue to proceed through the intersection with caution', 'Stop immediately and wait for the next green signal', 'Back up safely without hitting the car behind'],
  ['Motorcycle riders are required to wear:', 1, 'Fashionable sunglasses and leather jackets', 'Standard protective helmets', 'Regular construction hard hats'],
  ['Where would you see this sign? (School zone / children crossing)', 1, 'Commercial business center', 'School pedestrian crossing', 'Airport cargo runway approach'],
  ['How can you avoid wasting fuel?', 1, 'By revving your engine loudly at stoplights', 'By having your vehicle properly serviced and maintained', 'By using old engine oil repeatedly'],
  ['What does this traffic sign mean? (Red octagon)', 0, 'Stop', 'Do not enter', 'No entry for all types of vehicles'],
  ['In a road crash involving physical injury, the first duty of the involved driver is:', 1, 'Check damage to their own vehicle', 'Attend to the injured person and call for help', 'Escape the scene to avoid liability'],
  ['You service your own vehicle. How should you get rid of old engine oil?', 1, 'Pour it down the nearest drainage line', 'Dispose of it properly', 'Keep it in an unsealed container in your kitchen'],
  ['What is the maximum allowable width of a motorcycle saddle box or bag?', 0, '14 inches from both sides', '18 inches from both sides', '24 inches from both sides'],
  ['When more than one driver arrives at a four-way stop, who has the right of way?', 0, 'The driver who arrived first', 'The driver who blows their horn loudest', 'The vehicle with the biggest engine'],
  ['What is the fine for the first offense of RA 10666 on children aboard a motorcycle?', 1, '1,500 pesos', '3,000 pesos', '5,000 pesos'],
  ['How does alcohol affect you?', 1, 'It improves night vision', 'It reduces concentration', 'It speeds up emergency braking reaction time'],
  ['What is the meaning of "beating the red light"?', 1, 'Stopping completely before the white line', 'Driving faster upon seeing a yellow amber light', 'Turning right on a red light with caution'],
  ['Under RA 10666, which condition prohibits a rider from conveying a child?', 1, 'On standard city streets with slow traffic lanes', 'Where a speed limit of more than 60 kph is imposed', 'During early morning hours before school starts'],
  ['What should you do on a highway with many potholes?', 1, 'Maintain top speed to jump over them', 'Decrease speed', 'Swerve sharply back and forth'],
  ['Using a backbone motorcycle, which stand should you use when parking overnight?', 2, 'Side stand', 'Cross stand', 'Center stand'],
  ['What does this traffic sign mean? (Curving arrow to the right)', 0, 'Dangerous right curve', 'Dangerous left curve', 'Dangerous curve'],
  ['Ahead is a vehicle with a flashing yellow light. This means it is:', 1, 'A broken-down vehicle', 'Slow moving', "A doctor's car"],
  ['What should you do if the road is wet?', 2, 'Increase speed to dry the tires', 'Keep swerving across lanes', 'Slow down'],
  ['What comes next after a yellow traffic light?', 2, 'Blue', 'Green', 'Red'],
  ['Which traffic light requires you to prepare for a stop?', 0, 'Yellow / Amber', 'Green', 'Red'],
  ['A blue traffic light means:', 2, 'Go', 'Stop', 'None; there are no blue traffic lights'],
  ['What does this traffic sign mean? (Motorcycle with a red slash)', 2, 'No cars', 'Cars only', 'No motorcycles'],
  ['At road works with a temporary "No Overtaking" sign, you must:', 0, 'Follow the sign as advised', 'Overtake quickly', 'Ignore it if workers are not visible'],
  ['How much is the penalty for the second offense of RA 10666?', 1, '3,000 pesos', '5,000 pesos', '10,000 pesos'],
  ['What should you do when approaching road work with a temporary maximum speed limit?', 0, 'Comply with the sign at all times', 'Slow down only when machinery is operating', 'Maintain normal highway speed'],
  ['A no parking sign means:', 0, 'A motorist may temporarily stop to load or unload without obstructing traffic', 'An absolute ban on stopping under any circumstances', 'Parking is allowed only for motorcycles'],
  ['You approach an intersection with malfunctioning traffic signals. What should you do?', 1, 'Drive through at full speed', 'Treat it as if there were stop signs in all directions', 'Wait until an LTO enforcer arrives'],
  ['When emergency vehicles with sirens are on the road, what should you do?', 1, 'Race ahead to clear their path', 'Give way by pulling to the left or right as circumstances require', 'Maintain your lane and stop completely'],
  ['What does this traffic sign mean? (Two cars with a red slash)', 1, 'Keep distance', 'No overtaking', 'Two-way traffic ahead'],
  ['A driver has an arm out the window bent upward. What is the intention?', 1, 'Turn left', 'Turn right', 'Stop'],
  ['What does this traffic sign mean? (S-curve line)', 2, 'No swerving', 'Change lane', 'Dangerous curve ahead'],
  ['What LTO authority is granted to a learner, valid for one year?', 2, "Nonprofessional driver's license", "Professional driver's license", "Student driver's permit"],
  ['Signs that are round, inverted triangle, or octagonal with a red border are called:', 0, 'Regulatory signs', 'Warning signs', 'Informative signs'],
  ['You want to turn left at a green arrow light. Can you proceed?', 0, 'Yes, it is a protected turn', 'No, wait for the circular green light', 'Yes, but yield to oncoming straight traffic'],
  ['What should be done first before changing lanes?', 2, 'Make a signal', 'Check traffic ahead', 'Check mirrors for traffic behind'],
  ['When is it legal to use the shoulder to overtake?', 1, 'When the vehicle ahead is slow', 'You are not legally allowed to pass using the shoulder in normal circumstances', 'Only when passing a multi-axle truck'],
  ['What can cause you to skid and lose control during an abrupt move on a wet road?', 1, 'Proper downshifting', 'Improper braking', 'Smooth acceleration'],
  ['To help reduce air pollution when using your brake, what should you do?', 0, 'Brake properly', 'Brake frequently', 'Brake suddenly'],
  ['What does this traffic sign mean? (U-shaped arrow with a red slash)', 0, 'No U-turn', 'Dangerous left bend', 'Dangerous right bend'],
  ['Why should you not use a mobile phone while riding a motorcycle?', 2, 'Reception is poor while the engine runs', 'It affects the vehicle electronic system', 'It is prohibited by law and distracts your attention while driving'],
];

export const motorcycleAA1English: Question[] = rows.map(([question, correctIndex, ...options]) => ({
  question,
  options,
  correctIndex,
  explanation: `Correct answer: ${options[correctIndex]}.`,
  difficulty: 'Medium',
}));

// To show a road sign or driving scenario beside a question, add an image path:
// motorcycleAA1English[2].image = '/images/lto/questions/traffic-lights-ahead.webp';
motorcycleAA1English[24].image = '/images/Stop_sign.webp';
motorcycleAA1English[2].image = '/images/Philippines-Warning-Sign-Warning-for-a-traffic-light.webp';
motorcycleAA1English[22].image = '/images/children_crossing.webp';
motorcycleAA1English[35].image = '/images/Philippines-Warning-Sign-Warning-for-a-sharp-curve-to-the-right.webp';
motorcycleAA1English[41].image = '/images/philippines-no-motorcycles.svg';
motorcycleAA1English[48].image = '/images/No overtaking.webp';
motorcycleAA1English[50].image = '/images/Philippines-Warning-Sign-Warning-for-curves.webp';
motorcycleAA1English[58].image = '/images/No U-turn.webp';
motorcycleAA1English[10].image = '/images/lto/questions/yellow-traffic-light.svg';
motorcycleAA1English[14].image = '/images/lto/questions/flashing-yellow-traffic-light.svg';
motorcycleAA1English[38].image = '/images/lto/questions/yellow-traffic-light.svg';
motorcycleAA1English[39].image = '/images/lto/questions/yellow-traffic-light.svg';
