import type { Gender } from '../types'

/**
 * Country-appropriate character names. Countries map to cultural name
 * pools; each pool has 25 male + 25 female first names and 25 last
 * names, so every country draws from at least 25 of each.
 */

export interface NamePool {
  male: string[]
  female: string[]
  last: string[]
}

const POOLS: Record<string, NamePool> = {
  anglo: {
    male: ['James', 'Oliver', 'Jack', 'Henry', 'Liam', 'Noah', 'Ethan', 'Mason', 'Logan', 'Lucas', 'Benjamin', 'William', 'Alexander', 'Daniel', 'Samuel', 'Thomas', 'Charlie', 'Harry', 'George', 'Owen', 'Dylan', 'Nathan', 'Ryan', 'Caleb', 'Aaron'],
    female: ['Olivia', 'Emma', 'Amelia', 'Sophia', 'Charlotte', 'Isabella', 'Ava', 'Grace', 'Lily', 'Chloe', 'Ella', 'Mia', 'Emily', 'Hannah', 'Zoe', 'Ruby', 'Evie', 'Daisy', 'Alice', 'Florence', 'Harper', 'Willow', 'Ivy', 'Poppy', 'Freya'],
    last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Clark', 'Walker', 'Hall', 'Young', 'Allen', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Turner', 'Parker'],
  },
  hispanic: {
    male: ['Santiago', 'Mateo', 'Sebastián', 'Diego', 'Alejandro', 'Daniel', 'Gabriel', 'Adrián', 'Javier', 'Carlos', 'Miguel', 'Fernando', 'Andrés', 'Ricardo', 'Eduardo', 'Luis', 'Jorge', 'Pablo', 'Hugo', 'Iván', 'Emilio', 'Raúl', 'Marcos', 'Tomás', 'Álvaro'],
    female: ['Sofía', 'Valentina', 'Isabella', 'Camila', 'Valeria', 'Lucía', 'Martina', 'Daniela', 'Gabriela', 'Victoria', 'Natalia', 'Mariana', 'Paula', 'Andrea', 'Carmen', 'Elena', 'Rosa', 'Alejandra', 'Fernanda', 'Catalina', 'Ximena', 'Renata', 'Julieta', 'Antonella', 'Regina'],
    last: ['García', 'Rodríguez', 'Martínez', 'Hernández', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ramos', 'Vargas', 'Castillo', 'Jiménez', 'Moreno'],
  },
  francophone: {
    male: ['Louis', 'Gabriel', 'Jules', 'Lucas', 'Hugo', 'Arthur', 'Léo', 'Raphaël', 'Antoine', 'Nicolas', 'Théo', 'Maxime', 'Baptiste', 'Étienne', 'Olivier', 'Pierre', 'Julien', 'Mathis', 'Clément', 'Adrien', 'Rémi', 'Thibault', 'Damien', 'Florian', 'Pascal'],
    female: ['Emma', 'Louise', 'Chloé', 'Camille', 'Léa', 'Manon', 'Juliette', 'Alice', 'Inès', 'Sarah', 'Jade', 'Zoé', 'Charlotte', 'Margaux', 'Élodie', 'Amélie', 'Céline', 'Claire', 'Mathilde', 'Aurélie', 'Océane', 'Pauline', 'Noémie', 'Elise', 'Anaïs'],
    last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Girard', 'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Faure', 'Mercier', 'Blanc'],
  },
  german: {
    male: ['Lukas', 'Leon', 'Finn', 'Jonas', 'Paul', 'Felix', 'Noah', 'Elias', 'Maximilian', 'Ben', 'Moritz', 'Tim', 'Jan', 'Niklas', 'Tobias', 'Florian', 'Sebastian', 'Matthias', 'Stefan', 'Andreas', 'Klaus', 'Wolfgang', 'Dieter', 'Jürgen', 'Hans'],
    female: ['Mia', 'Emma', 'Hannah', 'Sofia', 'Anna', 'Lea', 'Lena', 'Marie', 'Laura', 'Julia', 'Katharina', 'Sabine', 'Claudia', 'Petra', 'Monika', 'Ursula', 'Ingrid', 'Helga', 'Greta', 'Frieda', 'Clara', 'Amelie', 'Johanna', 'Charlotte', 'Luisa'],
    last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Lange', 'Werner', 'Krause'],
  },
  italian: {
    male: ['Leonardo', 'Francesco', 'Alessandro', 'Lorenzo', 'Matteo', 'Andrea', 'Gabriele', 'Riccardo', 'Tommaso', 'Edoardo', 'Marco', 'Giuseppe', 'Antonio', 'Giovanni', 'Luca', 'Davide', 'Pietro', 'Salvatore', 'Vincenzo', 'Stefano', 'Angelo', 'Franco', 'Roberto', 'Paolo', 'Enzo'],
    female: ['Sofia', 'Giulia', 'Aurora', 'Alice', 'Ginevra', 'Emma', 'Giorgia', 'Greta', 'Beatrice', 'Anna', 'Chiara', 'Francesca', 'Elena', 'Valentina', 'Alessia', 'Martina', 'Sara', 'Elisa', 'Federica', 'Lucia', 'Rosa', 'Maria', 'Paola', 'Silvia', 'Bianca'],
    last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi'],
  },
  portuguese: {
    male: ['Miguel', 'Arthur', 'Gael', 'Théo', 'Davi', 'Gabriel', 'Bernardo', 'Samuel', 'João', 'Pedro', 'Lucas', 'Matheus', 'Rafael', 'Gustavo', 'Felipe', 'Bruno', 'Tiago', 'Diogo', 'André', 'Ricardo', 'Nuno', 'Rui', 'Vasco', 'Duarte', 'Afonso'],
    female: ['Maria', 'Alice', 'Sophia', 'Laura', 'Valentina', 'Helena', 'Beatriz', 'Mariana', 'Ana', 'Carolina', 'Inês', 'Matilde', 'Leonor', 'Francisca', 'Camila', 'Luana', 'Fernanda', 'Juliana', 'Larissa', 'Gabriela', 'Rita', 'Catarina', 'Sofia', 'Clara', 'Isabela'],
    last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Fernandes', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Ribeiro', 'Alves', 'Monteiro', 'Mendes', 'Barbosa', 'Freitas', 'Cardoso', 'Teixeira', 'Correia'],
  },
  nordic: {
    male: ['William', 'Oscar', 'Hugo', 'Elias', 'Axel', 'Erik', 'Lars', 'Anders', 'Magnus', 'Björn', 'Nils', 'Gustav', 'Henrik', 'Johan', 'Karl', 'Olav', 'Sven', 'Mikkel', 'Emil', 'Viktor', 'Aksel', 'Espen', 'Kasper', 'Mads', 'Sören'],
    female: ['Alma', 'Freja', 'Astrid', 'Saga', 'Elsa', 'Ingrid', 'Sigrid', 'Maja', 'Ida', 'Agnes', 'Ebba', 'Linnea', 'Tuva', 'Hedda', 'Solveig', 'Karin', 'Annika', 'Birgitta', 'Marit', 'Liv', 'Thea', 'Nora', 'Signe', 'Vilde', 'Ronja'],
    last: ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsen', 'Hansen', 'Johansen', 'Pedersen', 'Nielsen', 'Jensen', 'Berg', 'Haugen', 'Lund', 'Dahl', 'Bakken', 'Lindqvist', 'Virtanen', 'Korhonen', 'Mäkinen', 'Nieminen', 'Jónsson', 'Magnusson', 'Holm'],
  },
  slavic: {
    male: ['Ivan', 'Dmitri', 'Alexei', 'Nikolai', 'Sergei', 'Mikhail', 'Andrei', 'Vladimir', 'Pavel', 'Yuri', 'Boris', 'Oleg', 'Viktor', 'Anton', 'Roman', 'Marek', 'Jakub', 'Tomasz', 'Piotr', 'Krzysztof', 'Milan', 'Luka', 'Nikola', 'Stefan', 'Bogdan'],
    female: ['Anastasia', 'Natalia', 'Olga', 'Tatiana', 'Irina', 'Svetlana', 'Ekaterina', 'Maria', 'Anna', 'Vera', 'Yelena', 'Daria', 'Polina', 'Ksenia', 'Agnieszka', 'Katarzyna', 'Zofia', 'Magdalena', 'Ivana', 'Jelena', 'Milica', 'Petra', 'Lenka', 'Tereza', 'Nadia'],
    last: ['Ivanov', 'Petrov', 'Smirnov', 'Kuznetsov', 'Popov', 'Volkov', 'Novak', 'Kowalski', 'Nowak', 'Wójcik', 'Kaminski', 'Zielinski', 'Horvat', 'Kovač', 'Jovanović', 'Petrović', 'Nikolić', 'Marković', 'Dvořák', 'Svoboda', 'Novotný', 'Bondarenko', 'Shevchenko', 'Kovalenko', 'Sokolov'],
  },
  greek: {
    male: ['Georgios', 'Dimitrios', 'Konstantinos', 'Ioannis', 'Nikolaos', 'Panagiotis', 'Vasilis', 'Christos', 'Athanasios', 'Michalis', 'Andreas', 'Petros', 'Stavros', 'Alexandros', 'Spyros', 'Theodoros', 'Antonis', 'Manolis', 'Stelios', 'Kostas', 'Ilias', 'Aris', 'Fotis', 'Thanos', 'Lefteris'],
    female: ['Maria', 'Eleni', 'Katerina', 'Vasiliki', 'Sofia', 'Angeliki', 'Georgia', 'Dimitra', 'Konstantina', 'Ioanna', 'Despina', 'Anastasia', 'Evangelia', 'Christina', 'Panagiota', 'Athina', 'Zoe', 'Alexandra', 'Kalliopi', 'Fotini', 'Niki', 'Irini', 'Margarita', 'Chrysa', 'Elpida'],
    last: ['Papadopoulos', 'Papadakis', 'Karagiannis', 'Vlachos', 'Antoniou', 'Nikolaou', 'Georgiou', 'Dimitriou', 'Papas', 'Economou', 'Makris', 'Konstantinou', 'Alexiou', 'Christodoulou', 'Stavrou', 'Panagiotopoulos', 'Theodorou', 'Athanasiou', 'Ioannidis', 'Petridis', 'Samaras', 'Katsaros', 'Zafeiriou', 'Kouris', 'Diamantis'],
  },
  turkish: {
    male: ['Mehmet', 'Mustafa', 'Ahmet', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Osman', 'Yusuf', 'Murat', 'Ömer', 'Emre', 'Burak', 'Kemal', 'Serkan', 'Volkan', 'Tolga', 'Baran', 'Cem', 'Deniz', 'Arda', 'Kaan', 'Berat', 'Eren', 'Furkan'],
    female: ['Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Şerife', 'Zehra', 'Sultan', 'Hülya', 'Esra', 'Merve', 'Selin', 'Deniz', 'Ceren', 'Gamze', 'Pınar', 'Burcu', 'Aslı', 'Yasemin', 'Derya', 'Ebru', 'Gül', 'Nur'],
    last: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Erdoğan', 'Güneş', 'Aksoy', 'Türkmen'],
  },
  arabic: {
    male: ['Mohammed', 'Ahmed', 'Ali', 'Omar', 'Youssef', 'Khaled', 'Hassan', 'Hussein', 'Ibrahim', 'Mahmoud', 'Mostafa', 'Karim', 'Tarek', 'Sami', 'Nabil', 'Rami', 'Fadi', 'Ziad', 'Bilal', 'Hamza', 'Amir', 'Salem', 'Faisal', 'Waleed', 'Adel'],
    female: ['Fatima', 'Aisha', 'Mariam', 'Zainab', 'Layla', 'Nour', 'Huda', 'Salma', 'Amira', 'Rania', 'Dina', 'Yasmin', 'Hana', 'Samira', 'Leila', 'Farida', 'Nadia', 'Reem', 'Dalia', 'Sara', 'Lina', 'Maha', 'Iman', 'Khadija', 'Asma'],
    last: ['Al-Ahmad', 'Al-Sayed', 'Hassan', 'Ibrahim', 'Mahmoud', 'Mansour', 'Haddad', 'Khalil', 'Nasser', 'Saleh', 'Farah', 'Aziz', 'Hamdan', 'Khoury', 'Najjar', 'Sabbagh', 'Zayed', 'Rahal', 'Awad', 'Taha', 'Baghdadi', 'Sultan', 'Karam', 'Fares', 'Amin'],
  },
  persian: {
    male: ['Ali', 'Reza', 'Mohammad', 'Hossein', 'Amir', 'Mehdi', 'Hamid', 'Saeed', 'Behnam', 'Farhad', 'Kaveh', 'Arash', 'Babak', 'Dariush', 'Kianoush', 'Navid', 'Omid', 'Parsa', 'Ramin', 'Sohrab', 'Shahram', 'Kamran', 'Bijan', 'Farid', 'Ehsan'],
    female: ['Fatemeh', 'Zahra', 'Maryam', 'Narges', 'Sara', 'Niloufar', 'Shirin', 'Leila', 'Parisa', 'Azadeh', 'Roya', 'Mahsa', 'Yasaman', 'Elham', 'Mina', 'Nasrin', 'Golnaz', 'Shadi', 'Setareh', 'Anahita', 'Bahar', 'Donya', 'Firoozeh', 'Laleh', 'Mitra'],
    last: ['Hosseini', 'Ahmadi', 'Mohammadi', 'Rezaei', 'Karimi', 'Moradi', 'Jafari', 'Rahimi', 'Ebrahimi', 'Sadeghi', 'Kazemi', 'Bagheri', 'Hashemi', 'Ghasemi', 'Salehi', 'Amini', 'Zarei', 'Farahani', 'Tehrani', 'Shirazi', 'Yazdani', 'Nazari', 'Sharifi', 'Fallah', 'Rostami'],
  },
  hebrew: {
    male: ['Noam', 'David', 'Ariel', 'Daniel', 'Yosef', 'Itai', 'Uri', 'Lior', 'Eitan', 'Omer', 'Yonatan', 'Amit', 'Ido', 'Roi', 'Gilad', 'Nadav', 'Oren', 'Tal', 'Elad', 'Avi', 'Moshe', 'Shai', 'Boaz', 'Doron', 'Erez'],
    female: ['Noa', 'Maya', 'Tamar', 'Yael', 'Shira', 'Talia', 'Michal', 'Avigail', 'Roni', 'Hila', 'Adi', 'Lia', 'Noga', 'Rotem', 'Inbar', 'Keren', 'Dana', 'Efrat', 'Gali', 'Hadar', 'Ayelet', 'Liat', 'Meital', 'Orly', 'Sigal'],
    last: ['Cohen', 'Levi', 'Mizrahi', 'Peretz', 'Biton', 'Dahan', 'Avraham', 'Friedman', 'Katz', 'Malka', 'Azoulay', 'Gabay', 'Ohayon', 'Shapiro', 'Ben-David', 'Amar', 'Hadad', 'Golan', 'Sharon', 'Barak', 'Segal', 'Rosen', 'Weiss', 'Berger', 'Stern'],
  },
  southAsian: {
    male: ['Aarav', 'Arjun', 'Rohan', 'Vikram', 'Raj', 'Amit', 'Sanjay', 'Rahul', 'Ankit', 'Dev', 'Karan', 'Nikhil', 'Pranav', 'Ravi', 'Suresh', 'Aditya', 'Manish', 'Deepak', 'Harish', 'Kiran', 'Imran', 'Bilal', 'Faisal', 'Tariq', 'Zubair'],
    female: ['Priya', 'Ananya', 'Diya', 'Aishwarya', 'Kavya', 'Neha', 'Pooja', 'Riya', 'Shreya', 'Sneha', 'Anjali', 'Deepika', 'Meera', 'Nisha', 'Radha', 'Sita', 'Lakshmi', 'Divya', 'Isha', 'Tanvi', 'Ayesha', 'Fatima', 'Sana', 'Zara', 'Noor'],
    last: ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Reddy', 'Nair', 'Iyer', 'Mehta', 'Joshi', 'Desai', 'Chopra', 'Malhotra', 'Kapoor', 'Rao', 'Das', 'Banerjee', 'Chatterjee', 'Khan', 'Ahmed', 'Hussain', 'Fernando', 'Perera', 'Thapa'],
  },
  chinese: {
    male: ['Wei', 'Jun', 'Ming', 'Hao', 'Lei', 'Qiang', 'Yong', 'Jian', 'Feng', 'Bo', 'Chen', 'Long', 'Kai', 'Peng', 'Tao', 'Xin', 'Yang', 'Zhi', 'Cheng', 'Dong', 'Guo', 'Hui', 'Liang', 'Shan', 'Zhong'],
    female: ['Mei', 'Ling', 'Xiu', 'Hua', 'Fang', 'Na', 'Jing', 'Li', 'Yan', 'Xia', 'Qing', 'Hong', 'Juan', 'Lan', 'Min', 'Ning', 'Ping', 'Rui', 'Shu', 'Ting', 'Wen', 'Xue', 'Ying', 'Yu', 'Zhen'],
    last: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Guo', 'He', 'Lin', 'Gao', 'Luo', 'Zheng', 'Liang', 'Xie', 'Tang', 'Song'],
  },
  japanese: {
    male: ['Haruto', 'Yuto', 'Sota', 'Yuki', 'Hayato', 'Haruki', 'Ryusei', 'Koki', 'Sora', 'Sosuke', 'Kenta', 'Daiki', 'Takumi', 'Kaito', 'Ren', 'Hiroshi', 'Takeshi', 'Kazuki', 'Shota', 'Riku', 'Itsuki', 'Minato', 'Yamato', 'Keita', 'Naoki'],
    female: ['Yui', 'Aoi', 'Hina', 'Sakura', 'Ichika', 'Akari', 'Sara', 'Yuna', 'Mio', 'Rin', 'Koharu', 'Mei', 'Hana', 'Saki', 'Miyu', 'Kaede', 'Ayaka', 'Haruka', 'Misaki', 'Nanami', 'Riko', 'Tsumugi', 'Yuka', 'Emi', 'Kanna'],
    last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Saito', 'Matsumoto', 'Inoue', 'Kimura', 'Hayashi', 'Shimizu', 'Yamazaki', 'Mori', 'Abe', 'Ikeda', 'Hashimoto'],
  },
  korean: {
    male: ['Min-jun', 'Seo-jun', 'Do-yun', 'Ye-jun', 'Si-woo', 'Ha-jun', 'Ji-ho', 'Jun-seo', 'Eun-woo', 'Hyun-woo', 'Ji-hoon', 'Woo-jin', 'Sung-min', 'Jae-hyun', 'Dong-hyun', 'Tae-yang', 'Min-seok', 'Kyung-soo', 'Young-ho', 'Sang-hoon', 'Joon-ho', 'Seung-hyun', 'Hyun-jin', 'In-su', 'Chan-woo'],
    female: ['Seo-yeon', 'Ji-woo', 'Seo-hyun', 'Min-seo', 'Ha-eun', 'Ye-eun', 'Yu-na', 'Chae-won', 'Soo-ah', 'Ji-yoo', 'Eun-ji', 'Hye-jin', 'Su-jin', 'Ji-eun', 'Mi-young', 'Eun-bi', 'Na-yeon', 'Da-eun', 'So-yeon', 'Yeon-woo', 'Hyo-joo', 'Bo-ra', 'Ga-eun', 'Se-ah', 'Yu-jin'],
    last: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim', 'Han', 'Oh', 'Seo', 'Shin', 'Kwon', 'Hwang', 'Ahn', 'Song', 'Yoo', 'Hong', 'Jeon', 'Moon', 'Bae', 'Baek', 'Nam'],
  },
  southeastAsian: {
    male: ['Minh', 'Anh', 'Duc', 'Hung', 'Nam', 'Somchai', 'Anan', 'Krit', 'Niran', 'Ploy', 'Agus', 'Budi', 'Dian', 'Eko', 'Rizky', 'Putra', 'Wayan', 'Ahmad', 'Farid', 'Hafiz', 'Aung', 'Zaw', 'Sokha', 'Dara', 'Phong'],
    female: ['Linh', 'Huong', 'Mai', 'Thao', 'Ngoc', 'Siriporn', 'Malee', 'Kanya', 'Pim', 'Nok', 'Siti', 'Dewi', 'Sari', 'Putri', 'Ayu', 'Ratna', 'Indah', 'Nur', 'Aisyah', 'Fatimah', 'Thida', 'Hla', 'Sreymom', 'Chanthou', 'Bopha'],
    last: ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Dang', 'Saetang', 'Srisuk', 'Chaiyasit', 'Wongsawat', 'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Hidayat', 'Abdullah', 'Rahman', 'Ismail', 'Hassan', 'Win', 'Htun', 'Sok', 'Chea', 'Keo'],
  },
  african: {
    male: ['Kwame', 'Kofi', 'Chinedu', 'Emeka', 'Oluwaseun', 'Adebayo', 'Tunde', 'Chukwudi', 'Sekou', 'Mamadou', 'Ousmane', 'Abdoulaye', 'Juma', 'Baraka', 'Kamau', 'Otieno', 'Tafari', 'Tesfaye', 'Dawit', 'Haile', 'Thabo', 'Sipho', 'Bongani', 'Tendai', 'Farai'],
    female: ['Ama', 'Akosua', 'Chioma', 'Ngozi', 'Adaeze', 'Folake', 'Yewande', 'Amina', 'Fatoumata', 'Aissatou', 'Mariama', 'Zawadi', 'Amani', 'Wanjiru', 'Achieng', 'Makena', 'Selam', 'Tigist', 'Hiwot', 'Abeba', 'Thandiwe', 'Nomvula', 'Zanele', 'Rudo', 'Chipo'],
    last: ['Mensah', 'Osei', 'Boateng', 'Okafor', 'Okonkwo', 'Adeyemi', 'Balogun', 'Diallo', 'Traoré', 'Keita', 'Cissé', 'Ndiaye', 'Mwangi', 'Otieno', 'Njoroge', 'Ochieng', 'Tesfaye', 'Bekele', 'Abebe', 'Dlamini', 'Nkosi', 'Khumalo', 'Moyo', 'Ncube', 'Chikwana'],
  },
  dutch: {
    male: ['Daan', 'Sem', 'Lucas', 'Finn', 'Levi', 'Luuk', 'Bram', 'Jesse', 'Thijs', 'Lars', 'Milan', 'Ruben', 'Sven', 'Jan', 'Pieter', 'Willem', 'Hendrik', 'Joris', 'Koen', 'Maarten', 'Niels', 'Stijn', 'Timo', 'Wouter', 'Gijs'],
    female: ['Emma', 'Julia', 'Sophie', 'Lotte', 'Eva', 'Lisa', 'Anna', 'Sara', 'Fleur', 'Noor', 'Tess', 'Femke', 'Sanne', 'Iris', 'Maud', 'Roos', 'Anouk', 'Esmee', 'Lieke', 'Marit', 'Nienke', 'Puck', 'Veerle', 'Yara', 'Jasmijn'],
    last: ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'de Graaf', 'van der Meer', 'Kuipers'],
  },
}

/** ISO2 → name pool. Anything unmapped falls back to 'anglo'. */
const COUNTRY_POOL: Record<string, keyof typeof POOLS> = {
  US: 'anglo', GB: 'anglo', AU: 'anglo', CA: 'anglo', NZ: 'anglo', IE: 'anglo',
  BS: 'anglo', BB: 'anglo', JM: 'anglo', TT: 'anglo', GY: 'anglo', BZ: 'anglo',
  AG: 'anglo', DM: 'anglo', GD: 'anglo', KN: 'anglo', LC: 'anglo', VC: 'anglo',
  FJ: 'anglo', PG: 'anglo', SB: 'anglo', VU: 'anglo', WS: 'anglo', TO: 'anglo',
  KI: 'anglo', TV: 'anglo', NR: 'anglo', MH: 'anglo', FM: 'anglo', PW: 'anglo',
  ES: 'hispanic', MX: 'hispanic', AR: 'hispanic', CO: 'hispanic', CL: 'hispanic',
  PE: 'hispanic', VE: 'hispanic', EC: 'hispanic', BO: 'hispanic', PY: 'hispanic',
  UY: 'hispanic', CR: 'hispanic', PA: 'hispanic', DO: 'hispanic', CU: 'hispanic',
  GT: 'hispanic', HN: 'hispanic', SV: 'hispanic', NI: 'hispanic', GQ: 'hispanic',
  PH: 'hispanic', AD: 'hispanic',
  FR: 'francophone', MC: 'francophone', LU: 'francophone', BE: 'francophone',
  SN: 'francophone', CI: 'francophone', ML: 'francophone', BF: 'francophone',
  NE: 'francophone', TD: 'francophone', CM: 'francophone', GA: 'francophone',
  CG: 'francophone', CD: 'francophone', DJ: 'francophone', HT: 'francophone',
  MG: 'francophone', KM: 'francophone', GN: 'francophone', BJ: 'francophone',
  TG: 'francophone', CF: 'francophone', RW: 'francophone', BI: 'francophone',
  DE: 'german', AT: 'german', CH: 'german', LI: 'german',
  NL: 'dutch',
  IT: 'italian', SM: 'italian', VA: 'italian', MT: 'italian',
  PT: 'portuguese', BR: 'portuguese', AO: 'portuguese', MZ: 'portuguese',
  CV: 'portuguese', GW: 'portuguese', ST: 'portuguese', TL: 'portuguese',
  SE: 'nordic', NO: 'nordic', DK: 'nordic', FI: 'nordic', IS: 'nordic',
  RU: 'slavic', UA: 'slavic', BY: 'slavic', PL: 'slavic', CZ: 'slavic',
  SK: 'slavic', BG: 'slavic', RS: 'slavic', HR: 'slavic', BA: 'slavic',
  ME: 'slavic', MK: 'slavic', SI: 'slavic', RO: 'slavic', MD: 'slavic',
  AL: 'slavic', HU: 'slavic', EE: 'slavic', LV: 'slavic', LT: 'slavic',
  GE: 'slavic', AM: 'slavic',
  GR: 'greek', CY: 'greek',
  TR: 'turkish', AZ: 'turkish', KZ: 'turkish', KG: 'turkish', UZ: 'turkish', TM: 'turkish',
  SA: 'arabic', EG: 'arabic', DZ: 'arabic', MA: 'arabic', TN: 'arabic', LY: 'arabic',
  SD: 'arabic', SY: 'arabic', IQ: 'arabic', JO: 'arabic', LB: 'arabic', YE: 'arabic',
  OM: 'arabic', AE: 'arabic', QA: 'arabic', KW: 'arabic', BH: 'arabic', MR: 'arabic',
  SO: 'arabic', ER: 'arabic', SS: 'arabic',
  IR: 'persian', AF: 'persian', TJ: 'persian',
  IL: 'hebrew',
  IN: 'southAsian', PK: 'southAsian', BD: 'southAsian', LK: 'southAsian',
  NP: 'southAsian', BT: 'southAsian', MV: 'southAsian',
  CN: 'chinese', TW: 'chinese', SG: 'chinese',
  JP: 'japanese',
  KR: 'korean', KP: 'korean',
  TH: 'southeastAsian', VN: 'southeastAsian', KH: 'southeastAsian', LA: 'southeastAsian',
  MM: 'southeastAsian', MY: 'southeastAsian', ID: 'southeastAsian', BN: 'southeastAsian',
  NG: 'african', GH: 'african', KE: 'african', TZ: 'african', UG: 'african',
  ZA: 'african', ZW: 'african', ZM: 'african', MW: 'african', ET: 'african',
  LR: 'african', SL: 'african', GM: 'african', BW: 'african', NA: 'african',
  LS: 'african', SZ: 'african', MU: 'african', SC: 'african',
}

/** The cultural pool key a country belongs to (shared with schools.ts). */
export function poolKeyFor(countryCode: string | null): string {
  return COUNTRY_POOL[countryCode ?? ''] ?? 'anglo'
}

function poolFor(countryCode: string | null): NamePool {
  return POOLS[poolKeyFor(countryCode)]
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomFirstName(countryCode: string | null, gender: Gender): string {
  const pool = poolFor(countryCode)
  return pick(gender === 'male' ? pool.male : pool.female)
}

export function randomLastName(countryCode: string | null): string {
  return pick(poolFor(countryCode).last)
}

export function randomGender(): Gender {
  return Math.random() < 0.5 ? 'male' : 'female'
}
